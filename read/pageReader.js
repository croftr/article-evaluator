const jsdom = require("jsdom");
const readerResource = require("../rest/readerResource");
const sentimentReader = require("../analyze/sentimentReader");
const textNoramaliser = require("../utils/textNormaliser.js")

var logger = require('../logger');

const pagesScanned = [];
let pagesEvaluatedCount = 0;
let finalScore = 0;
let pageCount = 0;

const ignoreTerms = ['global+development']

const shouldSkipUrl = (url) => {
  let skipUrl = false;
  for (term of ignoreTerms) {
    if (url.toLowerCase().includes(term)) {
      skipUrl = true;
      break;
    }
  }
  return skipUrl;
  
}

const evaluatePage = ({ pageResults, title, tag }) => {

  pagesEvaluatedCount++;

  const sentimentScore = sentimentReader.getSentiment(title);
  const sentimentResult =
    sentimentScore > 0
      ? "POSITIVE"
      : sentimentScore === 0
        ? "NEUTRAL"
        : "NEGATIVE";

  if (sentimentScore !== 0) {
    logger.info(`${sentimentResult}: ${title}`);
  }

  pageResults.push({ tag, text: textNoramaliser.normalise(title), sentiment: sentimentResult });
}

const self = (module.exports = {

  readPage: async ({ baseUrl, pageUrl, tags }) => {
    let pageUrlsCount = 0;
    pageCount++;

    logger.info(
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

      const url = link.href;

      if (url.startsWith(baseUrl) &&
        !pagesScanned.includes(url)
      ) {

        pagesScanned.push(url);
        pageUrlsCount++;

        //skip urls with certain keywords
        if (shouldSkipUrl(url)) {
          continue;
        }
      
        const response = await readerResource.getArticle(url);
        const dom = new jsdom.JSDOM(response);
        const title = dom.window.document.title;
        const titleLower = title.toLowerCase();

        tags.forEach(tag => {

          if (tag === '*') {
            evaluatePage({ pageResults, title, tag: 'all' });
          } else if (titleLower.includes(tag)) {
            logger.info(`Tag match [${tag}] with title ${title}`);
            evaluatePage({ pageResults, title, tag });
          }

          readerResource.writeToFile(pageResults, pageCount);
        })

        logger.debug(
          `Page ${pageCount} page URLS ${pageUrlsCount} total URLS ${pagesScanned.length}`
        );
      }
    }

    logger.info(`Overall score for ${tags.join(" ")} is ${finalScore}`);
    logger.info(
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
