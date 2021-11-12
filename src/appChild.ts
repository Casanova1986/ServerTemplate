import { clientMongo } from './mongoConnect';
import { clientRedis } from './redisConnect';

const express = require('express');
const http = require('http');
const cors = require('cors');
const app = express();
app.use(cors());
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
    console.log('listening on port: 3000');
  });

  io.sockets.on('connection', (socket) => {
    console.log(`Worker ${process.pid} started for ${socket.id}`);
    console.info(`Client connected id = ${socket.id}`);
    // initialize this client's sequence number
    sequenceNumberByClient.set(socket, 1);
    socket.on('chat message', (msg) => {
      console.log('Add Message Success from Id:', socket.id + '  ' + msg);
      clientRedis.HMSET('TestSocketServer', socket.id, JSON.stringify(msg), (err, res) => {
        if (err) console.log(err);
        else console.log('Add Message Success from Id:', socket.id + '  ' + msg);
      });
      clientMongo.create(
        {
          userId: socket.id,
          message: JSON.stringify(msg),
        },
        (err: any, res: any) => {
          if (err) console.log(err);
          else console.log('Data is saved!');
        }
      );
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
