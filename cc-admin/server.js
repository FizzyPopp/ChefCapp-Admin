'use strict'

var express = require('express');
var cors = require('cors')
var cca = require('cc-admin');
var msg = console.log;
const port = 3000;
let corsOrigin = 'http://ec2-18-191-186-158.us-east-2.compute.amazonaws.com';

const flags = process.argv.slice(2);
if (flags.length > 0) {
  if(flags[0] === '--dev') {
    msg('DEVELOP FLAG ON, DO NOT RUN THIS IN PRODUCTION')
    corsOrigin = 'localhost';
  }
}

const corsOptions = {
  orign: corsOrigin,
  optionsSuccessStatus: 204 // some legacy browsers (IE11, various SmartTVs) choke on 204, use 200 instead
}

var app = express();
app.use(express.static('web'))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

msg('cc-admin service running on port ' + port);

app.get('/', (req, res) => {
  res.send('index.html');
});

app.post('/recipe', (req, res) => {

});

app.post('/validate', (req, res) => {
  let obj = req.body;
  let result = cca.validate(obj);

  msg('recieved request with body:' + req.body);
  res.json(result);
});


app.post('/ingredient', (req, res) => {
  let obj = req.body;
});

app.post('/step', (req, res) => {
});



app.listen(port);
