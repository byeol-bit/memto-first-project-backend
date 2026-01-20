const express = require('express');
const app = express();
const url = require('url');

function start() {
    // let pathname = url.parse(request.url).pathname;
    // if (pathname === '/favicon.ico') {
    //     response.writeHead(204);
    //     return response.end();
    // }
    app.get('/', (req, res) => {
        res.send('server running');
    });

    app.listen(3000, () => {
        console.log('port 3000 is listening');
    });
}

module.exports = { start };