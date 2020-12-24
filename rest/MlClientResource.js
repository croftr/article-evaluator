const fetch = require("node-fetch");
const fs = require("fs");
const util = require("util");

const readdir = util.promisify(fs.readdir);
const rename = util.promisify(fs.rename);

const BASE_DIR = "results";

const URL = '';

module.exports = {
  postResults: async (body) => {
    const response = await fetch(url,  { method: 'POST', body });
    const body = await response.text();
    return body;
  }
};
