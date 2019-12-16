var express = require('express');
var router = express.Router();
/**
var jwt = require('express-jwt');
var auth = jwt({
	secret : "secret",
	userProperty: 'payload'
}); **/


var fnc = require('../controllers/fileNames');

router.get('/fileNames/:type', fnc.getFileNames)
router.get('/annotation/:fileName', fnc.getAnnotation)

module.exports = router;