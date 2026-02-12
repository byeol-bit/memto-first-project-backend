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
    apis: ['./*.js', './routes/*.js']
};

const specs = swaggereJsdoc(options);

module.exports = {
    swaggerUi,
    specs
};

/**
 * @swagger
 * securityDefinitions:
 *   jwtCookie:
 *     type: apiKey
 *     in: cookie
 *     name: token
 */