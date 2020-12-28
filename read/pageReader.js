const jsdom = require("jsdom");
const readerResource = require("../rest/readerResource");
const MLRestClient = require("../rest/MLRestClient");
const sentimentReader = require("../analyze/sentimentReader");
const textNoramaliser = require("../utils/textNormaliser.js")
const dateUtils = require('../utils/dateUtils.js')
const urlUtils = require('../utils/urlUtils.js')
var params = require('../params');

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
  virtualConsole.sendTo(console, { omitJSDOMErrors: true });
  virtualConsole.on("error", () => { });
  virtualConsole.on("warn", () => { });
  virtualConsole.sendTo({});
  const dom = new jsdom.JSDOM(response, {});
  const links = dom.window.document.querySelectorAll("a");

  return links;
}

const self = (module.exports = {

  readPage: async ({ baseUrl, pageUrl, tags, resultsForSource }) => {

    logger.info("---------------------------------------------NEW PAGE-----------------------------------------------------");
    logger.info("Scanning page " + pageUrl);

    if (pagesScanned.includes(pageUrl)) {
      logger.info('SKIP: Already scanned page ' + pageUrl);
      return;
    }

    pagesScanned.push(pageUrl);

    let pageUrlsCount = 0;
    let index = 0;

    const links = await collectPageLinks({ pageUrl });

    logger.info('Got ' + links.length + ' links for page ' + pageUrl);

    const pageResults = [];

    for (let link of links) {

      index++;

      const url = urlUtils.makeAbsolute({ baseUrl, urlToCheck: link.href });

      if (!urlUtils.isSameOrigin({ baseUrl, urlToCheck: url })) {
        logger.debug('Skipping ' + index + ' (Not same origin) ' + url);
        continue;
      } else if (pagesVisited.includes(url)) {
        logger.debug('Skipping ' + index + ' (Already visited) ' + url);
        continue;
      } else if (shouldSkipUrl(url)) { //skip urls with certain keywords
        logger.debug('Skipping ' + index + ' (Keywords) ' + url);
        continue;
      }

      logger.debug('Reading ' + index + ' ' + url);

      pagesVisited.push(url);

      const response = await readerResource.getArticle(url);
      const dom = new jsdom.JSDOM(response);

      if (dateUtils.isRecentArticle(dom.window.document)) {

        const title = dom.window.document.title;
        const titleLower = title.toLowerCase();

        tags.forEach(tag => {

          if (tag === '*') {
            evaluatePage({ pageResults, title, tag: 'all' });
          } else if (titleLower.includes(tag)) {
            logger.info(`Tag match [${tag}] with title ${title}`);
            evaluatePage({ pageResults, title, tag });
          }

          // readerResource.writeToFile(pageResults, pagesScanned.length);
        })

      }

      if (pageResults.length > 0) {
        const data = pageResults.map(i => { return { headline: i.text, sentiment: i.sentiment } })
        resultsForSource.newData = resultsForSource.newData.concat(data);
      }
      // await self.readPage({ baseUrl, pageUrl: url, tags });
    }

    logger.info(`Overall score for page ${pagesScanned.length} using tags ${tags.join(" ")} is ${finalScore}`);

    return pagesVisited;
  },
  readDom: async ({ tags, baseUrl, pageUrl, id, description }) => {

    readerResource.setUp(tags);

    const requestId = `${id}_${new Date().getTime()}`;
    const resultsForSource = {
      id: requestId,
      source: description,
      tags,
      newData: []
    };

    const pages = await self.readPage({ baseUrl, pageUrl, tags, resultsForSource });
  
    for await (let pageUrl of pages) {
      await self.readPage({ baseUrl, pageUrl, tags, resultsForSource });
    }

    //store the response on file in case rest call fails so we can re-send 
    readerResource.serializeObject(resultsForSource, requestId);

    //send the results to the rest service 
    MLRestClient.postResults(resultsForSource);

  },
});
