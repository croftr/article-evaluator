var express = require('express');
var router = express.Router();
var reader = require('../read/pageReader');

var logger = require('../logger');

router.get('/', function(req, res, next) {  

  const tags = req.query.tags ? req.query.tags.split(',') : [];
  const baseUrl = req.query.baseUrl;
  const pageUrl = req.query.pageUrl;

  logger.info(`baseUrl ${baseUrl} pageUrl ${pageUrl} tags ${req.query.tags}`);

  if (!baseUrl || !pageUrl) {
    res.status(400).send({ message: 'You must provide a baseUrl and a pageUrl'})
  } else {    
    reader.readDom({ baseUrl, pageUrl, tags });  
    res.send({ message: `Scanning articles from baseUrl ${baseUrl} pageUrl ${pageUrl} using tags ${req.query.tags}`});  
  }

  
});

module.exports = router;
