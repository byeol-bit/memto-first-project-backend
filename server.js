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
        'http://localhost:5173'
    ]}));
    app.use(express.json());
    app.use('/api', swaggerUi.serve, swaggerUi.setup(specs));
    app.use('', router);

    app.get('/', (req, res) => {
        res.send('server running!!');
    });
    app.listen(8080, () => {
        console.log('port 8080 is listening');
    });
}

function close() {
    server.close(() => process.exit(0))
}

process.on('SIGINT', close);
process.on('SIGTERM', close);

module.exports = { start };