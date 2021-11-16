const mongoose = require('mongoose');

let mongodb;
let mongoDbUrl = 'mongodb://192.168.1.187:27017/Jack_Test';

function connect(callback) {
  mongoose.connect(mongoDbUrl, (err, db) => {
    if (err) console.log(err);
    else {
      mongodb = db;
      callback();
    }
  });
}
function get() {
  return mongodb;
}

function close() {
  mongodb.close();
}

module.exports = {
  connect,
  get,
  close,
};
