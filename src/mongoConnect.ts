const mongoose = require('mongoose');

let linkMongo = 'mongodb://192.168.1.187:27017/feeds';
mongoose.connect(linkMongo, {}).then(
  async () => {
    console.log('Mongo Connected');
  },
  (err: any) => {
    console.log(err);
  }
);

const schema = new mongoose.Schema({ userId: 'string', message: 'string' });
export const clientMongo = mongoose.model('clientMongo', schema);
