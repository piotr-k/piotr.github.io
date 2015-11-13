'use strict';

// set variables for environment
var express = require('express');
var app = express();
var path = require('path');
var port = 9000;

// views as directory for all template files
app.set('views', path.join(__dirname, 'app/views'));

// use either 'jade' or 'ejs'
app.set('view engine', 'jade'); 

// instruct express to server up static assets
app.use(express.static('app'));
app.use(express.static(path.join(__dirname, '.tmp')));

// set routes
app.get('/', function(req, res) {
  res.render('index');
});

app.get('/clubw', function(req, res) {
  res.render('clubw');
});

// Set server port
app.listen(port);
console.log("Server is running at => http://localhost:" + port + "/\nCTRL + C to shutdown");