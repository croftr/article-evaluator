var express = require('express');
var router = express.Router();
var reader = require('../read/pageReader');

/* GET users listing. */
router.get('/', function(req, res, next) {  

  reader.readDom({baseUrl: "https://www.theguardian.com", pageUrl: "https://www.theguardian.com/world"});
  res.send('respond with read status');
  
});

module.exports = router;
