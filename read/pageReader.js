const jsdom = require("jsdom");
const readerResource = require("../rest/readerResource")

module.exports = {
    readDom: async () => {

        const response = await readerResource.getArticle('https://www.theguardian.com');
        const dom = new jsdom.JSDOM(response);
        const links = dom.window.document.querySelectorAll('a');
        console.log('got links', links);

        for (let link of links) {
            console.log('link: ', link.href);
            if (link.href.startsWith('http')) {
                const response = await readerResource.getArticle(link);
                const dom = new jsdom.JSDOM(response);
                const title = dom.window.document.title;
                console.log('title ', title);
            }
        };


    }
}

