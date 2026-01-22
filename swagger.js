const swaggerUi = require('swagger-ui-express');
const swaggereJsdoc = require('swagger-jsdoc');

const options = {
    swaggerDefinition: {
        info: {
            title: '숨은맛집고수 API',
            version: '0.1.0',
            description: '숨은맛집고수 API with express',
        },
        host: 'localhost:3000',
        basePath: '/',
        components: {
            schemas: {}
        }
    },
    apis: ['./*.js']
};

const specs = swaggereJsdoc(options);

module.exports = {
    swaggerUi,
    specs
};

/**
 * @swagger
 * /api/example:
 *   post:
 *     tags:
 *       - test
 *     summary: 단순 예시1
 *     description: 테스트를 위한 간단한 예시입니다.
 *     parameters:
 *       - in: formData
 *         name: id
 *         type: number
 *         required: true
 *         description: id에 대한 설명, 이것저것 표시됨
 *       - in: formData
 *         name: password
 *     responses:
 *       200:
 *         description: OK
 *         schema:
 *           type: number
 *   get:
 *     tags:
 *       - test
 *     summary: 비어 있는 예시
 */