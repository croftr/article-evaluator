const fetch = require('node-fetch');

module.exports = {
    getArticle: async (url) => {                
        const response = await fetch(url);                
        const body = await response.text();            
        return body;    
    }
}