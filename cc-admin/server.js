'use strict'

var express = require('express');
var cors = require('cors')
var cca = require('cc-admin');
var msg = console.log;
const port = 3000;
let corsOrigin = '';

const flags = process.argv.slice(2);
if (flags.length > 0) {
  if(flags[0] === '--dev') {
    msg('DEVELOP FLAG ON, DO NOT RUN THIS IN PRODUCTION')
    corsOrigin = 'localhost';
  }
}

const corsOptions = {
  origin: corsOrigin,
  optionsSuccessStatus: 200
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

  msg(req);

  res.json(result);
});


app.post('/ingredient', (req, res) => {
  let obj = req.body;
  cca.db.pushObject(obj, 'ingredient')
     .then((pushed) => {
       res.json(pushed);
     })

});

app.post('/step', (req, res) => {
});

app.listen(port);
