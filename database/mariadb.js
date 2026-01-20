const mariadb = require('mysql2');

const connection = mariadb.createConnection(
    {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'fhm1111',
        database: 'hidden_master_db'
    }
);

module.exports = connection;