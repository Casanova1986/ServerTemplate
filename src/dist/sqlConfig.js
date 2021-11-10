var mysql = require('mysql');
// Create a connection to the database
var connection = mysql.createConnection({
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: 'ahihi@123',
    database: 'mydb',
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: true,
        trustServerCertificate: false
    }
});
// open the MySQL connection
connection.connect(function (error) {
    if (error)
        throw error;
    console.log('SQL Connnected.');
});
module.exports = connection;
