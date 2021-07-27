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
const dotenv = require('dotenv');
dotenv.config();

//!setup ada services
const adaService = require('./api/adaService')
//! SET this to true if want to demo fake data instead of waiting real server
LOCAL = "LOCAL"
BK = "BK"
global.CHOSSEN_SERVER = BK
global.UPLOAD_FAKE_DATA_TO_ADA = false;
global.UPLOAD_FAKE_RELAY = false;
global.LOG_FB_ENVCOND = false;
adaService.setup();


//! keep updating ada info to firebase
adaService.update_ada_info();

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


// //! Connect to react in case client need to make serverside requests
// app.use(function(req, res, next) {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//   next();
// });

// app.post("/post", (req, res) => {
//   console.log("Connected to React");
//   res.redirect("/");
// });
    
module.exports = app;
