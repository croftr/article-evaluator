const fetch = require("node-fetch");
const fs = require("fs");
const util = require("util");

const readdir = util.promisify(fs.readdir);
const rename = util.promisify(fs.rename);

const BASE_DIR = "results";

module.exports = {
  setUp: async () => {
    if (!fs.existsSync(BASE_DIR)) {
      fs.mkdirSync(BASE_DIR);
      fs.mkdirSync(`${BASE_DIR}/pos`);
      fs.mkdirSync(`${BASE_DIR}/neg`);
      fs.mkdirSync(`${BASE_DIR}/train`);
      fs.mkdirSync(`${BASE_DIR}/train/pos`);
      fs.mkdirSync(`${BASE_DIR}/train/neg`);
      fs.mkdirSync(`${BASE_DIR}/test`);
      fs.mkdirSync(`${BASE_DIR}/test/pos`);
      fs.mkdirSync(`${BASE_DIR}/test/neg`);
      fs.mkdirSync(`${BASE_DIR}/validate`);
      fs.mkdirSync(`${BASE_DIR}/validate/pos`);
      fs.mkdirSync(`${BASE_DIR}/validate/neg`);
    }
  },
  getArticle: async (url) => {
    const response = await fetch(url);
    const body = await response.text();
    return body;
  },
  writeToFile: async (results, pageCount) => {
    let totalFiles = 0;
    for (const [index, result] of results.entries()) {
      if (result.sentiment === "POSITIVE") {
        const writeStream = fs.createWriteStream(
          `./results/pos/pos_${index.toString()}_page${pageCount}.txt`
        );
        writeStream.write(result.text);
        writeStream.end();
        totalFiles++;
      } else if (result.sentiment === "NEGATIVE") {
        const writeStream = fs.createWriteStream(
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

  getDirLength: async (dir) => {
    return (await readdir(dir)).length;
  },

  getFilenames: async (dir) => {
    return await readdir(dir);
  },

  generateFiles: async (names, dirName, FilesLength, newDir) => {
    console.log("dirName =", dirName, "Files =", FilesLength);
    for (let file = 0; file < FilesLength; file++) {
      console.log(`file = ${file}`);

      console.log(`oldpath = ./results/${dirName}/${names[file]}`);
      newPath = `./results/${newDir}/${dirName}/${names[file]}`;
      console.log(`newPath = ${newPath}`);

      await rename(`./results/${dirName}/${names[file]}`, newPath);
    }
  },
  createMLSplit: async () => {
    //Split files into training 80% testing 20%
    //then split training into 80% training 20% validation
    //need equal positive and negative results in each section

    await module.exports.setUp();

    const posDir = "./results/pos";
    const negDir = "./results/neg";

    let posCount = await module.exports.getDirLength(posDir);
    let negCount = await module.exports.getDirLength(negDir);

    let numberOfFiles = posCount > negCount ? negCount : posCount;

    console.log(`numberOfFiles =`, numberOfFiles);

    const trainingFiles = Math.floor(numberOfFiles * 0.8);
    console.log(`trainingFiles =`, trainingFiles);

    let posNames = await module.exports.getFilenames(posDir);

    let negNames = await module.exports.getFilenames(negDir);

    await module.exports.generateFiles(posNames, "pos", trainingFiles, "train");
    await module.exports.generateFiles(negNames, "neg", trainingFiles, "train");

    posCount = await module.exports.getDirLength(posDir);
    negCount = await module.exports.getDirLength(negDir);

    NumberOfTestfiles = posCount > negCount ? negCount : posCount;

    console.log(`numberOfFiles =`, NumberOfTestfiles);

    posNames = await module.exports.getFilenames(posDir);

    negNames = await module.exports.getFilenames(negDir);

    await module.exports.generateFiles(
      posNames,
      "pos",
      NumberOfTestfiles,
      "test"
    );
    await module.exports.generateFiles(
      negNames,
      "neg",
      NumberOfTestfiles,
      "test"
    );
  },
};
