const mysql = require('mysql');
// Create a connection to the database
const connection = mysql.createConnection({
  host: '127.0.0.1',
  port: '3306',
  user: 'root',
  password: 'ahihi@123',
  database: 'mydb',
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: true, // for azure
    trustServerCertificate: false, // change to true for local dev / self-signed certs
  },
});

// open the MySQL connection
connection.connect((error) => {
  if (error) throw error;
  console.log('SQL Connnected.');
});

module.exports = connection;
