const jsdom = require("jsdom");
const readerResource = require("../rest/readerResource");
const sentimentReader = require("../analyze/sentimentReader");

const tags = ["trump"];
const pagesScanned = [];
let pagesEvaluatedCount = 0;
let finalScore = 0;
let pageCount = 0;

const self = module.exports = {

  readPage: async ({ baseUrl, pageUrl }) => {   

    let pageUrlsCount = 0;    
    pageCount++;
  
    console.log(`Page No ${pageCount}: Scanning from ${pageUrl} for keywords ${tags.join(',')}`);

    const response = await readerResource.getArticle(pageUrl);
    
    const dom = new jsdom.JSDOM(response);
    const links = dom.window.document.querySelectorAll("a");
    const pageResults = [];

    for (let link of links) {

      if (link.href.startsWith(baseUrl) && !pagesScanned.includes(link)) {

        pagesScanned.push(link.href);
        pageUrlsCount++;
        
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
          pagesEvaluatedCount++;

          const sentimentScore = sentimentReader.getSentiment(title);
          const sentimentResult =
            sentimentScore > 0
              ? "POSITIVE"
              : sentimentScore === 0
              ? "NEUTRAL"
              : "NEGATIVE";
          finalScore = finalScore + sentimentScore;

          console.log(sentimentResult);
          console.log(`Pages Evaluated ${pagesEvaluatedCount}. Accumulated score ${finalScore}`);          

          pageResults.push({ text: title, sentiment: sentimentResult });
        }

        console.log(`URLS processed: page ${pageUrlsCount} total ${pagesScanned.length}`);        
      }
    }
    const filesWritten = readerResource.writeToFile(pageResults, pageCount);

    console.log("files written: ", filesWritten);
    console.log(`Overall score for ${tags.join(" ")} is ${finalScore}`);    
    console.log(
      `Overall sentiment for ${tags.join(" ")} is ${
        finalScore > 0 ? "POSITIVE" : finalScore === 0 ? "NEUTRAL" : "NEGATIVE"
      }`
    );

    return pagesScanned;
            
  },  
  readDom: async ( {baseUrl, pageUrl} ) => {

    readerResource.setUp();
    const pages = await self.readPage({ baseUrl, pageUrl });

    for (index in pages) {      
      await self.readPage({ baseUrl, pageUrl: pages[index] });
    }
  }
 
};
