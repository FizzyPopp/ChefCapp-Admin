#!/usr/bin/env node
'use strict'

var express = require('express');
var cors = require('cors');
var cca = require('cc-api-engine');
var msg = (m) => console.log('[' + new Date().toISOString() + '] SRV => ' + m);
var strfy = JSON.stringify;
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
  orign: corsOrigin,
  optionsSuccessStatus: 204 // some legacy browsers (IE11, various SmartTVs) choke on 204, luckily we don't support legacy browsers
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
    // let idToken = req.idToken;
    // let idToken = '000';
    // cca.verifyIdToken(idToken)
    //    .then((uid) => {
    let steps = req.body.steps;
    let recipe = req.body.recipe;
    let idToken = req.body.idToken;
    msg('recipe/add candidate: ' + strfy(recipe));
    msg('step candidate: ' + strfy(steps));
    let result = cca.db.confirmRecipe(recipe, steps)

    if (result.validity === false) {
        msg('Invalid recipe/step semantics');
        msg(strfy(result))
        res.json(result);
    } else {
        msg('Valid recipe and step semantics, attempting push');
        cca.db.pushRecipe(recipe, steps)
           .then((ret) => {
               msg('returned good: ')
               msg (strfy(ret));
               res.json(ret)
           })
           .catch((ret) => {
               msg('recipe/add returned errors: ')
               msg (strfy(ret));
               res.json(ret)
           });
    }
       // }).catch((error) => {
       //     msg("Failed to validate uid: " + idToken);
       //     msg("Got error:  op" + strfy(error))
       //     res.json(error)
       // })
});

app.post('/recipe/build', (req, res) => {
    let candidate = req.body;
    msg('recipe/build got request with body: ' + strfy(candidate));
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
    // let idToken = req.idToken;
    // let idToken = '000';
    // cca.verifyIdToken(idToken)
    //    .then((uid) => {
    let obj = req.body;
    cca.db.stampObject(obj, 'ingredient')
       .then((ret) => {
           msg('object stamped: ' + strfy(ret));
           let candidate = ret.obj;
           return cca.db.pushIngredient(candidate)
       }).then((ret) => {
           msg('object pushed: ' + strfy(ret));
           msg(strfy(ret));
           res.json(ret)
       })
       .catch((ret) => {
           msg('err found: ' + strfy(ret));
           msg(strfy(ret));
           res.json(ret.errors)
       })
       // })
       // .catch((error) => {
       //     msg("Failed to validate uid: " + idToken);
       //     msg("Got error: " + strfy(error))
       //     res.json(error)
       // })
});

app.post('/unit/add', (req, res) => {
    let candidate = req.body;
    cca.db.addUnit(candidate)
       .then((ret) => {
           msg('unit candidate added to database: ' + candidate.singular);
           res.json(ret);
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