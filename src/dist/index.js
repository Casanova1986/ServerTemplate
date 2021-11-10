"use strict";
exports.__esModule = true;
var redisAdapter = require("socket.io-redis");
//const net = require('net') ;
//const sio = require('socket.io');
//const farmhash = require('farmhash');
var cluster = require('cluster');
var numCPUs = require("os").cpus().length;
if (cluster.isMaster) {
    spawnChildServer();
    console.log("----------" + cluster.isMaster);
}
else {
    require('./appChild');
}
function spawnChildServer() {
    var workers = new Array();
    console.log("SpawnChildServer");
    var spawn = function (i) {
        workers[i] = cluster.fork();
        // Optional: Restart worker on exit
        workers[i].on('exit', function (code, signal) {
            console.log('respawning worker', i);
            spawn(i);
        });
    };
    for (var i = 0; i < numCPUs; i++) {
        console.log("SpawnChild " + i);
        spawn(i);
    }
    cluster.on('exit', function (deadWorker, code, signal) {
        var worker = cluster.fork();
        var newPID = worker.process.pid;
        var oldPID = deadWorker.process.pid;
        console.log('worker ' + oldPID + ' died.' + "code" + code + "signal" + signal);
        console.log('worker ' + newPID + ' born.');
    });
}
