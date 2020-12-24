var logger = require('../logger');
var params = require('../params');

/**
 * Get published metadata from the appication/ld script and find the published date
 * if there is no published date or we cant parse it then returned undefined 
 * @param {object} document - the entire dom document containing the published meta data 
 * @return {Date} - the document was published or undefined 
 */
const findArticleDate = (document) => {

    let articleDate;

    const meta = document.querySelectorAll('script[type="application/ld+json"]');

    for (let element of meta) {
        //loop until we find the article date 
        if (articleDate) {
            break;
        }
        
        const text = element.innerHTML;    
        
        if (typeof text === 'object') {
            metaArray = text;
        } else if (text) {
            try {
                metaArray = JSON.parse(text);
            } catch (e) {                
                logger.warn('cant parse type ' + typeof text);                
                metaArray = text;
            }            
        }
        
        if (Array.isArray(metaArray)) {            
            for (let i of metaArray) {                            
                if (i.datePublished) {                    
                    articleDate = new Date(i.datePublished);
                    break;
                }
            };        
        } else if (typeof metaArray === 'string') {
            //todo find datePublished in the string
            //metaArray.datePublished = metaArray.subtring(1,2);
            return;            
        } else {
            if (metaArray.datePublished) {
                articleDate = new Date(metaArray.datePublished);
                break;
            }                        
        }
    }
    logger.debug('Published date: ' + articleDate); 
    return articleDate;
};


module.exports = {
    /**     
     * @param {*} document - to read the date from 
     * @return {boolean} - false if published date > ACCEPTED_ARTICLE_DAYS_AGE
     */
    isRecentArticle: (document) => {

        const articleDate = findArticleDate(document);

        if (!articleDate) {
            return false;
        } else {

            const today = new Date();
            const timeDif = today.getTime() - articleDate.getTime();
            const dayDif = timeDif / (1000 * 3600 * 24);

            logger.debug('article ' + document.title + ' is ' + dayDif + ' days old');

            if (dayDif > params.ACCEPTED_ARTICLE_DAYS_AGE) {
                return false;
            }

            return true;
        }
    }
}

