const jsdom = require("jsdom");
const readerResource = require("../rest/readerResource")
const sentimentReader = require("../analyze/sentimentReader");

module.exports = {
    readDom: async () => {

        const response = await readerResource.getArticle('https://www.theguardian.com');
        const dom = new jsdom.JSDOM(response);
        const links = dom.window.document.querySelectorAll('a');
    
        for (let link of links) {
            // console.log('link: ', link.href);
            if (link.href.startsWith('http')) {
                const response = await readerResource.getArticle(link);
                const dom = new jsdom.JSDOM(response);
                const title = dom.window.document.title;
                console.log('title ', title);
                const sentiment = sentimentReader.getSentiment(title);
                console.log('sentiment ', sentiment);
                
                // console.log('Sentiment ', sentiment > 0 ? 'POSITIVE' : sentiment === 0 ? 'NEAUTRAL' : 'NEGATIVE');
            }
        };


    }
}

