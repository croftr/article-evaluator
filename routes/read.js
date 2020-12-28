var express = require('express');
var router = express.Router();
var reader = require('../read/pageReader');
var jobManager = require('../read/jobManager');
var params = require('../params');

var logger = require('../logger');

router.get('/', function (req, res, next) {

  const tags = req.query.tags ? req.query.tags.split(',') : [];

  res.send({ message: `Scanning articles from ${params.sources.map(i => i.pageUrl).join(',')} using tags ${req.query.tags}` });
  
  jobManager.processSources({ tags });

});

module.exports = router;
