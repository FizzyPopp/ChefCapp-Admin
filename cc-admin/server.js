'use strict'

var express = require('express');
var app = express();
var cca = require('cc-admin');

app.use(express.static('web'))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('index.html');
});

app.put('/recipe', (req, res) => {
});

app.put('/validate', (req, res) => {
  let obj = req.body;
  let result = cca.validate(obj);

  console.log(req);

  res.json(result);
});

app.listen(3000);
