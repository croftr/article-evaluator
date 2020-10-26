var express = require('express');
var router = express.Router();
var reader = require('../read/pageReader');

var logger = require('../logger');

router.get('/', function(req, res, next) {  

  logger.info('testing 124 ')
  
  const tags = req.query.tags ? req.query.tags.split(',') : [];
  console.log('Provided tags are ', tags);

  // reader.readDom({ baseUrl: "https://www.theguardian.com", pageUrl: "https://www.theguardian.com/world", tags });  
  res.send('respond with read status');  
});

module.exports = router;
