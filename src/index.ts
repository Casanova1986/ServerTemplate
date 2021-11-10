// const
//     {Server} = require("socket.io"),
//     server = new Server(5000);
import { testSocket} from './mongoConnect';
import {clientRedis} from './redisConnect';
const redisAdapter = require("socket.io-redis");
//const net = require('net') ;
//const sio = require('socket.io');
//const farmhash = require('farmhash');
const cluster = require('cluster');
const numCPUs = require("os").cpus().length;
if (cluster.isMaster) {
  spawnChildServer();
   console.log("----------" + cluster.isMaster)

} else {
  require('./appChild');
}

function spawnChildServer() {
  var workers = new Array();
  console.log("SpawnChildServer");
  var spawn = function(i) {
    
		workers[i] = cluster.fork();

		// Optional: Restart worker on exit
		workers[i].on('exit', function(code, signal) {
			console.log('respawning worker', i);
			spawn(i);
		});
  }
  for (let i = 0; i < numCPUs; i++) {
      console.log("SpawnChild " + i);
      spawn(i);
  }
  cluster.on('exit', (deadWorker, code, signal) => {
      var worker = cluster.fork();
      var newPID = worker.process.pid;
      var oldPID = deadWorker.process.pid;
      console.log('worker ' + oldPID + ' died.' + "code" + code + "signal" + signal);
      console.log('worker ' + newPID + ' born.');
  });
}

