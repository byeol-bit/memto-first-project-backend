let server = require('./server')

const mariadb = require('./database/mariadb');
mariadb.connection;

server.start()
