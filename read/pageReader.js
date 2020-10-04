const jsdom = require("jsdom");
const readerResource = require("../rest/readerResource")
const sentimentReader = require("../analyze/sentimentReader");

const tags = ['trump']

module.exports = {
    readDom: async () => {

        let finalScore =0;

        const response = await readerResource.getArticle('https://www.theguardian.com/world');
        const dom = new jsdom.JSDOM(response);
        const links = dom.window.document.querySelectorAll('a');

        for (let link of links) {

            if (link.href.startsWith('http')) {
                const response = await readerResource.getArticle(link);
                const dom = new jsdom.JSDOM(response);
                const title = dom.window.document.title;

                const titleLower = title.toLowerCase();
                    
                let match = false;

                for (let tag of tags) {
                    if (titleLower.includes(tag)) {
                        match = true;
                        break;
                    }
                }

                if (match) {
                    console.log(title);
                    const sentimentScore = sentimentReader.getSentiment(title);                                    
                    const sentimentResult = sentimentScore> 0 ? 'POSITIVE' : sentimentScore === 0 ? 'NEAUTRAL' : 'NEGATIVE'
                    finalScore = finalScore + sentimentScore;
                    console.log(sentimentResult);
                    console.log('Accumulated score: ', finalScore);
                    
                }
                
            }            
        };

        console.log(`Overall score for ${tags.join(' ')} is ${finalScore}`);
        console.log(`Overall sentiment for ${tags.join(' ')} is ${finalScore> 0 ? 'POSITIVE' : finalScore === 0 ? 'NEAUTRAL' : 'NEGATIVE'}`);

    }
}

