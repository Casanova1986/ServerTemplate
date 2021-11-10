const express = require('express');
const app = express();
// import { testSocket} from './mongoConnect';
// import {clientRedis} from './redisConnect';
const http = require('http');
const cors = require('cors');
app.use(cors());
const server = http.createServer(app);
let sequenceNumberByClient = new Map();
//const  {Server} = require('socket.io');
const io = require("socket.io")(server, {cors: {
  origin: "http://localhost:3000",
  methods: ["GET", "POST"],
  allowedHeaders: ["my-custom-header"],
  credentials: true
}});
// io.set('origins','*:*');
  server.listen(3000, () => {
    console.log('listening on *:3000');
  });
  let listProcess = new Array();
  listProcess.push(process.pid);
  console.log(listProcess);
   io.sockets.on("connection", (socket) => {
    console.log(`Worker ${process.pid} started for ${socket.id}`);
     console.info(`Client connected [id=${socket.id}]`);
     // initialize this client's sequence number
     sequenceNumberByClient.set(socket, 1);
     socket.on('chat message', (msg) => {
       console.log('Add Message Success from Id:', socket.id + '  ' + msg);
       // clientRedis.HMSET('TestSocketServer', socket.id, JSON.stringify(msg),  (err, res)  => {
       //   if (err) console.log(err);
       //   else console.log('Add Message Success from Id:', socket.id + '  ' + msg)
       // });
       // testSocket.create({userId: socket.id, message: JSON.stringify(msg)} , (err, res) => {
       //   if(err) throw err;
       //   console.log("Data is saved!");
       // });
     });
     setInterval(() => {
       for (const [client, sequenceNumber] of sequenceNumberByClient.entries()) {
           client.emit("seq-num", sequenceNumber);
           sequenceNumberByClient.set(client, sequenceNumber + 1);
       }
   }, 1000);
     // when socket disconnects, remove it from the list:
     socket.on("disconnected", () => {
         socket.disconnect();
         sequenceNumberByClient.delete(socket);
         console.info(`Client gone [id=${socket.id}]`);
     });
     
   // sends each client its current sequence number
   });