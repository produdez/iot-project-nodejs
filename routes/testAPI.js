var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next){
    res.send(' API is setup! ')
})

module.exports = router;