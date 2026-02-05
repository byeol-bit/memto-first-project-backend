const express = require('express');
const app = express();
const url = require('url');
const { swaggerUi, specs } = require('./swagger');
const router = require('./routes/index');
const cors = require('cors');

let server;

function start() {
    // let pathname = url.parse(request.url).pathname;
    // if (pathname === '/favicon.ico') {
    //     response.writeHead(204);
    //     return response.end();
    // }
    app.use(cors({ origin: [
        'http://localhost:5173',
        'https://memto-first-project-frontend.vercel.app/'
    ]
    }))
    app.get('/', (req, res) => {
        res.send('server running!!');
    });

    app.use(express.json());
    app.use('/api', swaggerUi.serve, swaggerUi.setup(specs));
    app.use('', router);

    app.use((err, req, res, next) => {
        console.error('--- ERROR 발생 ---');
        console.error(err.stack); 

        res.status(err.status || 500).json({
            success: false,
            message: err.message || "서버 내부 에러가 발생했습니다."
        });
    });
    app.listen(8080, '0.0.0.0', () => {
    console.log(`Server is listening on port 8080`);
});


}

function close() {
    server.close(() => process.exit(0))
}

process.on('SIGINT', close);
process.on('SIGTERM', close);

module.exports = { start };