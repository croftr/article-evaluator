var express = require('express');
var router = express.Router();
var reader = require('../read/pageReader');

router.get('/', function(req, res, next) {  
  
  const tags = req.query.tags ? req.query.tags.split(',') : [];
  console.log('Provided tags are ', tags);

  reader.readDom({ baseUrl: "https://www.theguardian.com", pageUrl: "https://www.theguardian.com/world", tags });  
  res.send('respond with read status');  
});

module.exports = router;
