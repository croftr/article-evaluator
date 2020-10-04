var Sentiment = require('sentiment');

module.exports = {
    getSentiment: (text) => {             
        var sentiment = new Sentiment();          
        var result = sentiment.analyze(text);
        
        return result.score;    
        // return result;
    }
}

