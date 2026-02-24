const mariadb = require('mysql2/promise');
require('dotenv').config();

const pool = mariadb.createPool(
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        timezone: '+09:00',
        waitForConnections: true,   
        connectionLimit: 6,          
        connectTimeout: 10000,       
        enableKeepAlive: true,      
        keepAliveInitialDelay: 10000
    }
);

module.exports = pool;