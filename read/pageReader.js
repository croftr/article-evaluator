const jsdom = require("jsdom");
const readerResource = require("../rest/readerResource")

module.exports = {
    readDom: async () => {
        const response = await readerResource.getArticle();
        const dom = new jsdom.JSDOM(response);
        const title = dom.window.document.title;                
        console.log('got title', title);        
    }
}

