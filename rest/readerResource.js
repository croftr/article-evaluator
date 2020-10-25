const fetch = require("node-fetch");
const fs = require("fs");
const util = require("util");

const readdir = util.promisify(fs.readdir);
const rename = util.promisify(fs.rename);

const BASE_DIR = "results";

module.exports = {
  setUp: async (tags) => {
    if (!fs.existsSync(BASE_DIR)) {
      fs.mkdirSync(BASE_DIR);

      tags.forEach(tag => {        
        fs.mkdirSync(`${BASE_DIR}/${tag}`);
        fs.mkdirSync(`${BASE_DIR}/${tag}/pos`);
        fs.mkdirSync(`${BASE_DIR}/${tag}/neg`);      
      })
      
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
          `./results/${result.tag}/pos/pos_${index.toString()}_page${pageCount}.txt`
        );
        writeStream.write(result.text);
        writeStream.end();
        totalFiles++;
      } else if (result.sentiment === "NEGATIVE") {
        const writeStream = fs.createWriteStream(
          `./results/${result.tag}/neg/neg_${index.toString()}_page${pageCount}.txt`
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
    // console.log("dirName =", dirName, "Files =", FilesLength);
    for (let file = 0; file < FilesLength; file++) {
      // console.log(`file = ${file}`);

      // console.log(`oldpath = ./results/${dirName}/${names[file]}`);
      const newFilePath = `${newDir}/${names[file]}`;
      // console.log(`newPath = ${newFilePath}`);

      await rename(`./results/${dirName}/${names[file]}`, newFilePath);
    }
  },
  createMLSplit: async () => {
    //Split files into training 80% testing 20%
    //then split training into 80% training 20% validation
    //need equal positive and negative results in each section

    await module.exports.setUp();

    const posDir = "./results/pos";
    const negDir = "./results/neg";

    //create training files

    let posCount = await module.exports.getDirLength(posDir);
    let negCount = await module.exports.getDirLength(negDir);

    let numberOfFiles = posCount > negCount ? negCount : posCount;

    console.log(`numberOfFiles =`, numberOfFiles);

    const trainingFiles = Math.floor(numberOfFiles * 0.8);
    console.log(`trainingFiles =`, trainingFiles);

    let posNames = await module.exports.getFilenames(posDir);

    let negNames = await module.exports.getFilenames(negDir);

    await module.exports.generateFiles(
      posNames,
      "pos",
      trainingFiles,
      "./results/train/pos"
    );
    await module.exports.generateFiles(
      negNames,
      "neg",
      trainingFiles,
      "./results/train/neg"
    );

    //create test files

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
      "./results/test/pos"
    );
    await module.exports.generateFiles(
      negNames,
      "neg",
      NumberOfTestfiles,
      "./results/test/neg"
    );

    //create validation files

    posTrainDir = "./results/train/pos";
    negTrainDir = "./results/train/neg";

    posCount = await module.exports.getDirLength(posTrainDir);
    negCount = await module.exports.getDirLength(negTrainDir);

    numberOfFiles = posCount > negCount ? negCount : posCount;

    console.log(`numberOfFiles =`, numberOfFiles);

    const validateFiles = Math.floor(numberOfFiles * 0.2);
    console.log(`validateFiles =`, validateFiles);

    posNames = await module.exports.getFilenames(posTrainDir);
    negNames = await module.exports.getFilenames(negTrainDir);

    await module.exports.generateFiles(
      posNames,
      "train/pos",
      validateFiles,
      "./results/validate/pos"
    );
    await module.exports.generateFiles(
      negNames,
      "train/neg",
      validateFiles,
      "./results/validate/neg"
    );
  },
};
