const jsdom = require("jsdom");
const readerResource = require("../rest/readerResource");
const sentimentReader = require("../analyze/sentimentReader");

// const tags = ["food","trump","europe","virus","covid","sport","uk","police","politics","religion","drug"];
const pagesScanned = [];
let pagesEvaluatedCount = 0;
let finalScore = 0;
let pageCount = 0;

const self = (module.exports = {

  readPage: async ({ baseUrl, pageUrl, tags }) => {
    let pageUrlsCount = 0;
    pageCount++;

    console.log(
      `Page No ${pageCount}: Scanning from ${pageUrl} for keywords ${tags.join(
        ","
      )}`
    );

    let response;
    try {
      response = await readerResource.getArticle(pageUrl);
    } catch (e) {
      console.error(`Failed to read from url ${pageUrl}` + e.message);
      throw e;
    }

    const dom = new jsdom.JSDOM(response);
    const links = dom.window.document.querySelectorAll("a");
    const pageResults = [];
    
    for (let link of links) {    
      
      if (link.href.startsWith(baseUrl) && !pagesScanned.includes(link)) {
        pagesScanned.push(link.href);
        pageUrlsCount++;
        
        const response = await readerResource.getArticle(link.href);
        const dom = new jsdom.JSDOM(response);
        const title = dom.window.document.title;
        const titleLower = title.toLowerCase();

        tags.forEach(tag => {
          
          if (titleLower.includes(tag)) {

            console.log(`Tag match [${tag}] with title ${title}`);

            pagesEvaluatedCount++;
  
            const sentimentScore = sentimentReader.getSentiment(title);
            const sentimentResult =
              sentimentScore > 0
                ? "POSITIVE"
                : sentimentScore === 0
                  ? "NEUTRAL"
                  : "NEGATIVE";
            
            if (sentimentScore !== 0) {
              console.log(sentimentResult);            
              console.log(
                `Pages Evaluated ${pagesEvaluatedCount}. Accumulated score ${finalScore}`
              );
            }
              
            pageResults.push({ tag, text: title, sentiment: sentimentResult });

          }

          readerResource.writeToFile(pageResults, pageCount);

        })

        console.log(
          `URLS processed: page ${pageUrlsCount} total ${pagesScanned.length}`
        );
      }
    }
    
    console.log(`Overall score for ${tags.join(" ")} is ${finalScore}`);
    console.log(
      `Overall sentiment for ${tags.join(" ")} is ${finalScore > 0 ? "POSITIVE" : finalScore === 0 ? "NEUTRAL" : "NEGATIVE"
      }`
    );

    return pagesScanned;
  },
  readDom: async ({ baseUrl, pageUrl, tags }) => {
    readerResource.setUp(tags);
    const pages = await self.readPage({ baseUrl, pageUrl, tags });

    for (index in pages) {
      await self.readPage({ baseUrl, pageUrl: pages[index], tags });
    }
  },
});
