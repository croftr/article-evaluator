const fetch = require("node-fetch");
var logger = require('../logger');

const url = 'https://news-sentiment-app.herokuapp.com/newData';

module.exports = {
  postResults: async (body) => {
    const payload = JSON.stringify(body);    
    const response = await fetch(url,
      {
        method: 'POST',
        body: payload,
        headers: { 'Content-Type': 'application/json' },
      });
    const responseBody = await response.text();
    logger.debug('ML REST response ' + responseBody);
    return responseBody;
  }
};
