const mariadb = require('mysql2');
require('dotenv').config();

const pool = mariadb.createPool(
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,

        waitForConnections: true,    // 연결이 꽉 찼을 때 대기
        connectionLimit: 5,          // 동시에 유지할 연결 수 (작게 시작하세요)
        connectTimeout: 10000,       // 연결 시도 시간 (10초)
        enableKeepAlive: true,       // 연결이 끊기지 않게 유지
        keepAliveInitialDelay: 10000 // 10초마다 생존 확인
    }
);

module.exports = pool;