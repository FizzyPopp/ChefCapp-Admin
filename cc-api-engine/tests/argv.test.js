'use strict'
var flags = process.argv.slice(2);
console.log('myArgs: ', flags);
console.log('myArgs.length: ', flags.length);
var corsOrigin = '';
if (flags.length > 0) {
  if(flags[0] === '--dev') {
    corsOrigin = 'localhost';
  }
}

console.log(corsOrigin);
