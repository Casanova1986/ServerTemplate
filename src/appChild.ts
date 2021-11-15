const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const cors = require('cors');
const app = express();
const mongoConfig = require('./mongoConnect');

import { UserController } from './Users/UserController';
import UserRouter from './Users/UserRouter';

app.use(cors());
app.use(express.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: '5mb',
  })
);
mongoConfig.connect(() => {
  console.log('Mongo Connected!');
});
app.use('/api/user', UserRouter);

const server = http.createServer(app);
let sequenceNumberByClient = new Map();

export default function AppChild() {
  // since socket v3, use alloweio3 to true for cors
  const io = require('socket.io')(server, {
    allowEIO3: true,
    cors: {
      // List IP client connect to server
      origin: 'http://192.168.1.91:8080',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  server.listen(3000, () => {
    console.log(`Worker ${process.pid} listening on port: 3000`);
  });
  io.sockets.on('connection', (socket) => {
    console.log(`Worker ${process.pid} started for ${socket.id}`);
    console.info(`Client connected id = ${socket.id}`);
    // initialize this client's sequence number
    sequenceNumberByClient.set(socket, 1);
    socket.on('user', (msg: any) => {
      let userMessage = new UserController();
      userMessage.processMessage(socket.id, msg);
    });
    // setInterval(() => {
    //   for (const [client, sequenceNumber] of sequenceNumberByClient.entries()) {
    //     client.emit('seq-num', sequenceNumber);
    //     sequenceNumberByClient.set(client, sequenceNumber + 1);
    //   }
    // }, 1000);
    // when socket disconnects, remove it from the list:
    socket.on('disconnected', () => {
      socket.disconnect();
      sequenceNumberByClient.delete(socket);
      console.info(`Client gone [id=${socket.id}]`);
    });
  });
}
