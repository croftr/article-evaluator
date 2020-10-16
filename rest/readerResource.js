const fetch = require("node-fetch");
const fs = require("fs");

module.exports = {
  getArticle: async (url) => {
    const response = await fetch(url);
    const body = await response.text();
    return body;
  },

  writeToFile: async (results) => {
    let totalFiles = 0;
    for (const [index, result] of results.entries()) {
      if (result.sentiment === "POSITIVE") {
        const writeStream = fs.createWriteStream(
          `./results/pos/pos_${index.toString()}.txt`
        );
        writeStream.write(result.text);
        writeStream.end();
        totalFiles++;
      } else if (result.sentiment === "NEGATIVE") {
        const writeStream = fs.createWriteStream(
          `./results/neg/neg_${index.toString()}.txt`
        );
        writeStream.write(result.text);
        writeStream.end();
        totalFiles++;
      } else {
        continue;
      }
    }

    return `files written = ${totalFiles}`;
  },
};
