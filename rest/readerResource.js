const fetch = require('node-fetch');

module.exports = {
    getArticle: async (url) => {
        console.log('get articles from ', url);
        
        const response = await fetch(url);                
        const body = await response.text();            
        return body;    
    }
}