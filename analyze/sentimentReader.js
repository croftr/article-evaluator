var Sentiment = require('sentiment');

module.exports = {
    getSentiment: (text) => {             
        var sentiment = new Sentiment();          
        var result = sentiment.analyze(text);
        const sentimentResult = result.score > 0 ? 'POSITIVE' : result.score === 0 ? 'NEAUTRAL' : 'NEGATIVE'
        return sentimentResult;    
        // return result;
    }
}

