var http = require('http');
var util = require('util');
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

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
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
  const subjects = req.body.subjects;
  const courses = [];
  var cnt = 0;
  var success = [];
  for (var i = 0; i < subjects.length; i++) {
    success.push(0);
  }
  while (cnt < subjects.length) {
    const url = API_ENDPOINT + '/courses/' + '?' + 'key=' + API_KEY + '&' + 'term=' + TERM + '&' + 'subject=' + subjects[cnt];
    request.get(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log('finished with cnt: ', cnt);
        success[cnt] = 1;
      } else {
        console.log('Error getting all the subjects');
      }
    });
    console.log('hi', success);
    cnt++;
  }

  while (success.indexOf(0) != -1) {
    console.log(success);
  }

  console.log(req.body.subjects.length);
});

app.listen(PORT);
console.log('server running at port: ' + PORT);
