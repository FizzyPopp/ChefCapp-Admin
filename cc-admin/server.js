'use strict'

var express = require('express');
var app = express();
var cca = require('./index');

app.get('/', (req, res) => {
  res.send('hello world');
});

app.post('/validate', (req, res) => {
    console.log(JSON.stringify(req));
});

app.listen(3000);
