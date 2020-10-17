const fetch = require("node-fetch");
const fs = require("fs");

const BASE_DIR = 'results';

module.exports = {

  setUp: async () => {
    
      if (!fs.existsSync(BASE_DIR)){
        fs.mkdirSync(BASE_DIR);        
        fs.mkdirSync(`${BASE_DIR}/pos`);
        fs.mkdirSync(`${BASE_DIR}/neg`);        
      }       
  },
  getArticle: async (url) => {
    const response = await fetch(url);
    const body = await response.text();
    return body;
  },
  writeToFile: async (results, pageCount) => {
    //take results and loop through
    //if positive put write to positive folder, negative to negative and neutral ignore
    //each file should only be text
    //console.log("results are:", results);
    let totalFiles = 0;
    for (const [index, result] of results.entries()) {
      console.log("result", result);
      if (result.sentiment === "POSITIVE") {
        const writeStream = await fs.createWriteStream(
          `./results/pos/pos_${index.toString()}_page${pageCount}.txt`
        );
        writeStream.write(result.text);
        writeStream.end();
        totalFiles++;
      } else if (result.sentiment === "NEGATIVE") {
        const writeStream = await fs.createWriteStream(
          `./results/neg/neg_${index.toString()}_page${pageCount}.txt`
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
