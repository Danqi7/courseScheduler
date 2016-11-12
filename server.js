var http = require('http');
var util = require('util');
var path = require('path');
var request = require('request');
var express = require('express');
var bodyParser = require('body-parser');

const PORT = process.env.PORT || 8080;

const API_ENDPOINT = 'http://api.asg.northwestern.edu';
const TERM = 4640;
const API_KEY = '3F8EQB3ziTJkYOZb';

var app = express();

var jsonParser = bodyParser.json();

// Add headers
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
     res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.use(express.static(__dirname + '/assets'));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/indexV2.0.html'));
});

app.get('/api/subjects', function(req, res) {
  const url = API_ENDPOINT + '/subjects/' + '?' + 'key=' + API_KEY + '&' + 'term=' + TERM;

  request.get(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log('Error getting all the subjects');
    }
  });
});

app.post('/api/courses', jsonParser, function(req, res) {
  const subject = req.body.subjects[0];
  const url = API_ENDPOINT + '/courses/' + '?' + 'key=' + API_KEY + '&' + 'term=' + TERM + '&' + 'subject=' + subject;

  request.get(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body)
    } else {
      console.log('Error getting all the courses for subject: ', subject);
    }
  });

  console.log(subject);
});

app.listen(PORT);
console.log('server running at port: ' + PORT);
