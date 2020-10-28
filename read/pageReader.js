const jsdom = require("jsdom");
const readerResource = require("../rest/readerResource");
const sentimentReader = require("../analyze/sentimentReader");
const textNoramaliser = require("../utils/textNormaliser.js")

var logger = require('../logger');

const pagesScanned = [];
const pagesVisited = [];
let pagesEvaluatedCount = 0;
let finalScore = 0;

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

const collectPageLinks = async ({ pageUrl }) => {

  let response;
  try {
    response = await readerResource.getArticle(pageUrl);
  } catch (e) {
    console.error(`Failed to read from url ${pageUrl}` + e.message);
    return [];
  }

  const virtualConsole = new jsdom.VirtualConsole();  
  virtualConsole.sendTo(console, {omitJSDOMErrors: true});
  virtualConsole.on("error", () => {  });
  virtualConsole.on("warn", () => {  });
  virtualConsole.sendTo({});
  const dom = new jsdom.JSDOM(response, {});
  const links = dom.window.document.querySelectorAll("a");

  return links;
}

const self = (module.exports = {

  readPage: async ({ baseUrl, pageUrl, tags }) => {

    logger.info("---------------------------------------------NEW PAGE-----------------------------------------------------");
    logger.info("Scanning page " + pageUrl);

    if (pagesScanned.includes(pageUrl)) {
      logger.info('SKIP: Already scanned page ' + pageUrl);
      return;
    }

    pagesScanned.push(pageUrl);
  
    let pageUrlsCount = 0;

    const links = await collectPageLinks({ pageUrl });

    const pageResults = [];

    for (let link of links) {

      const url = link.href;

      if (url.startsWith(baseUrl) &&
        !pagesVisited.includes(url)
      ) {

        pagesVisited.push(url);
        pageUrlsCount++;

        //skip urls with certain keywords
        if (shouldSkipUrl(url)) {
          logger.info('SKIP: Already visited url ' + pageUrl);
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

          readerResource.writeToFile(pageResults, pagesScanned.length);
        })

        logger.debug(
          `Page [${pagesScanned.length}] [${pageUrl}] URLS [${pageUrlsCount}] total [${pagesVisited.length}]`
        );

        // await self.readPage({ baseUrl, pageUrl: url, tags });
      }
    }

    logger.info(`Overall score for page ${pagesScanned.length} using tags ${tags.join(" ")} is ${finalScore}`);

    return pagesVisited;
  },
  readDom: async ({ baseUrl, pageUrl, tags }) => {
    readerResource.setUp(tags);
    const pages = await self.readPage({ baseUrl, pageUrl, tags });

    for (index in pages) {
      await self.readPage({ baseUrl, pageUrl: pages[index], tags });
    }
  },
});
