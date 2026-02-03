const express = require('express');
const app = express();
const url = require('url');
const { swaggerUi, specs } = require('./swagger');
const router = require('./routes/index');
const cors = require('cors');

function start() {

    app.use(cors({ origin: [
        'http://localhost:5173'
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

module.exports = { start };