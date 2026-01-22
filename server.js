const express = require('express');
const app = express();
const url = require('url');
const { swaggerUi, specs } = require('./swagger');

function start() {
    // let pathname = url.parse(request.url).pathname;
    // if (pathname === '/favicon.ico') {
    //     response.writeHead(204);
    //     return response.end();
    // }
    app.get('/', (req, res) => {
        res.send('server running!!');
    });

    app.use('/api', swaggerUi.serve, swaggerUi.setup(specs));

    app.listen(3000, () => {
        console.log('port 3000 is listening');
    });
}

module.exports = { start };