var logger = require('../logger');
var params = require('../params');

const findArticleDate = (document) => {             

    const metaDate = document.querySelector('meta[property="article:published_time"]');
    
    if (metaDate && metaDate.content) {
        return new Date(metaDate.content);
    }
}

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

