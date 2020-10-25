const fs = require("fs");
const getSentiment = require("./getSentiment");
const readerResource = require("../rest/readerResource");

module.exports = {
  fileReader: async () => {
    let results = [];
    const fileArray = fs
      .readFileSync(`rawInputFiles/snippets.txt`, "utf-8")
      .split("\n");

    for (let item of fileArray) {
      const sentimentResult = await getSentiment.getSentiment(item);
      if (sentimentResult) {
        if (
          sentimentResult.sentiment === "POSITIVE" ||
          sentimentResult.sentiment === "NEGATIVE" ||
          sentimentResult.sentiment === "NEUTRAL"
        ) {
          results.push(sentimentResult);
        } else {
          console.log("item ", item, " sentiment ", sentimentResult);
        }
      }
    }
    const filesWritten = await readerResource.writeToFile(results);

    console.log("files written: ", filesWritten);

    readerResource.createMLSplit();
  },
};
