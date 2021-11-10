"use strict";

var md5 = require('md5');

var numArray = [6, 5, 4];
numArray.toString(); // expected output: 6,5,4

console.log(numArray);
console.log(JSON.stringify(numArray));
var ok = new Date().getTime();
console.log(ok);
var test = 'ce4f7c2b8edb173e2533d7a1690805041471256697';
console.log(md5(test));