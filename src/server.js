'use strict';
const express = require('express');
let app = express();
const routes = require('./router');

// Allow Cross-Origin Header
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// setup the routes
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/api', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// error handler
// define as the last app.use callback
app.use(function (err, req, res) {
  res.status(err.status || 500);
  res.send(err.message);
});

app.listen(8666, function () {
  console.log('v-search-backend is listening on port 8666');
});
