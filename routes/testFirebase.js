firebase = require('firebase-admin')
var express = require('express');
var router = express.Router();

var db = firebase.database()
var ref = db.ref('Test')
router.get('/', function(req, res, next){
    ref.once("value")
        .then(function(snapshot) {
            res.send(snapshot.val())
        });
    
})

module.exports = router;