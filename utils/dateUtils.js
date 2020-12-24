var logger = require('../logger');
var params = require('../params');

const findArticleDate = (document) => {

    let articleDate;

    const meta = document.querySelectorAll('script[type="application/ld+json"]');

    for (let element of meta) {

        if (articleDate) {
            break;
        }
        
        const text = element.innerHTML;
        const metaArray = JSON.parse(text);

        if (Array.isArray(metaArray)) {            
            for (let i of metaArray) {                
                console.log('got pub date!!! ', i.datePublished);
                if (i.datePublished) {                    
                    articleDate = new Date(i.datePublished);
                    break;
                }
            };
        }
    }
    return articleDate;
};


    // const metaDate = document.querySelector('meta[property="article:published_time"]');

    // if (metaDate && metaDate.content) {
    //     return new Date(metaDate.content);
    // }

module.exports = {
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

