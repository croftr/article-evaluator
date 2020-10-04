const fetch = require('node-fetch');

module.exports = {
    getArticle: async () => {
        const response = await fetch('https://www.theguardian.com/us-news/2020/oct/04/i-feel-much-better-trump-releases-first-video-message-from-hospital-room');                
        const body = await response.text();            
        return body;    
    }
}