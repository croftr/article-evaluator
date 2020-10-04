const jsdom = require("jsdom");
const readerResource = require("../rest/readerResource")
const sentimentReader = require("../analyze/sentimentReader");

const tags = ['trump']

module.exports = {
    readDom: async () => {

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
                    const sentiment = sentimentReader.getSentiment(title);
                    console.log(sentiment);
                }

                // console.log('Sentiment ', sentiment > 0 ? 'POSITIVE' : sentiment === 0 ? 'NEAUTRAL' : 'NEGATIVE');
            }
        };


    }
}

