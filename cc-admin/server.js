'use strict'

var express = require('express');
var cors = require('cors')
var cca = require('cc-admin');
var msg = console.log;
var strfy = JSON.stringify;
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

app.post('/recipe/add', (req, res) => {
    let steps = req.body.steps;
    let recipe = req.body.recipe;
    // msg('recipe candidate: ' + strfy(recipe));
    let result = cca.db.confirmRecipe(recipe, steps)
    if (result.validity === false) {
        msg('Invalid recipe/step semantics');
        res.json(result);
    } else {
        msg('Valid recipe/step semantics, attempting push');
        cca.db.pushRecipe(recipe, steps)
           .then((ret) => {
               msg('returned good: ')
               msg (ret);
               res.json(ret)
           })
           .catch((ret) => {
               msg('returned errors: ')
               msg (ret);
               res.json(ret)
           });
    }
});


app.post('/recipe/build', (req, res) => {
    let candidate = req.body;
    // msg('got request with body: ' + strfy(candidate));
    cca.db.buildRecipe(candidate)
       .then((ret) => res.json(ret))
       .catch((ret) => res.json(ret));
})
app.post('/instruction/parse', (req, res) => {

    let instr = req.body.instructions;
    let instructions = cca.parser.transform(instr);
    // msg('request body:' + strfy(req.body));
    msg('transformed instructions:' + strfy(instructions));
    res.json(instructions);
})

app.post('/ingredient/add', (req, res) => {
    let obj = req.body;
    cca.db.stampObject(obj, 'ingredient')
       .then((ret) => {
           msg('object stamped: ' + strfy(ret));
           let candidate = ret.obj;
           return cca.db.pushIngredient(candidate)
       }).then((ret) => {
           msg('object pushed: ' + strfy(ret));
           res.json(ret)
       })
       .catch((ret) => {
           msg('err found: ' + strfy(ret));
           msg(strfy(ret));
           res.json(ret.errors)
       })
});

app.post('/echo', (req, res) => {
    msg('recieved request from:' + req.hostname + " ip:" + req.ip);
    msg('request body:' + strfy(req.body));
    res.sendStatus(200);
});

app.post('/validate', (req, res) => {
    let obj = req.body;
    let result = cca.validate(obj);

    msg('recieved request with body:' + req.body);
    res.json(result);
});

app.post('/validate/step/instructionString', (req, res) => {
    let obj = req.body;
    let instr = obj.instructions;
    let instrObj = cca.parser.transform(instr);

    obj.instructions = instrObj

    let result = cca.validate(obj);
    msg('recieved request with body:' + req.body);
    res.json(result);
});


app.listen(port);
