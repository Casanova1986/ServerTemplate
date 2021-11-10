"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var express = require('express');

var app = express(); // import { testSocket} from './mongoConnect';
// import {clientRedis} from './redisConnect';

var http = require('http');

var cors = require('cors');

app.use(cors());
var server = http.createServer(app);
var sequenceNumberByClient = new Map(); //const  {Server} = require('socket.io');

var io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
}); // io.set('origins','*:*');


server.listen(3000, function () {
  console.log('listening on *:3000');
});
var listProcess = new Array();
listProcess.push(process.pid);
console.log(listProcess);
io.sockets.on("connection", function (socket) {
  console.log("Worker ".concat(process.pid, " started for ").concat(socket.id));
  console.info("Client connected [id=".concat(socket.id, "]")); // initialize this client's sequence number

  sequenceNumberByClient.set(socket, 1);
  socket.on('chat message', function (msg) {
    console.log('Add Message Success from Id:', socket.id + '  ' + msg); // clientRedis.HMSET('TestSocketServer', socket.id, JSON.stringify(msg),  (err, res)  => {
    //   if (err) console.log(err);
    //   else console.log('Add Message Success from Id:', socket.id + '  ' + msg)
    // });
    // testSocket.create({userId: socket.id, message: JSON.stringify(msg)} , (err, res) => {
    //   if(err) throw err;
    //   console.log("Data is saved!");
    // });
  });
  setInterval(function () {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = sequenceNumberByClient.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var _step$value = _slicedToArray(_step.value, 2),
            client = _step$value[0],
            sequenceNumber = _step$value[1];

        client.emit("seq-num", sequenceNumber);
        sequenceNumberByClient.set(client, sequenceNumber + 1);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator["return"] != null) {
          _iterator["return"]();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }, 1000); // when socket disconnects, remove it from the list:

  socket.on("disconnected", function () {
    socket.disconnect();
    sequenceNumberByClient["delete"](socket);
    console.info("Client gone [id=".concat(socket.id, "]"));
  }); // sends each client its current sequence number
});