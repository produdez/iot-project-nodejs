//! Firebase setup
var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://iot-202-default-rtdb.asia-southeast1.firebasedatabase.app"
});


var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var testAPI = require('./routes/testAPI')
var testFirebase = require('./routes/testFirebase');
var app = express();

//! setup ada server connection
//get key from online link
getJSON = require('./api/getJSON')
ada_info = JSON.parse(getJSON('http://dadn.esp32thanhdanh.link/'))
let [key1, key2] = ada_info.key.split(':')

//write the info on env variable so that other services can use
const dotenv = require('dotenv');
dotenv.config();

process.env.BK_ADA_KEY1 = key1
process.env.BK_ADA_KEY2 = key2
console.log('Acc1: ',process.env.BK_ADA_ID1,'---',process.env.BK_ADA_KEY1)
console.log('Acc2: ',process.env.BK_ADA_ID2,'---',process.env.BK_ADA_KEY2)

//setup ada services
const notificationService = require('./api/notificationService')
notificationService.setup()
const moistureService = require('./api/moistureService')
moistureService.setup()

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/testAPI', testAPI);
app.use('/testFirebase', testFirebase);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
