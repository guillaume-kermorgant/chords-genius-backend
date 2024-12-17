'use strict'

const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, './.env') });

const http = require('http');

const LISTENER_PORT = process.env.LISTENER_PORT;

function checkEnv() {
    let errorMessage = '';
    if (!LISTENER_PORT) {
        errorMessage = 'LISTENER_PORT env variable should be defined.\n';
    }

    if (errorMessage !== '') {
        throw new Error(errorMessage);
    }
}

(async () => {
    try {
        checkEnv();
        console.info('Starting server...');

        const app = require('./src/server/app');
        const server = http.createServer({}, app);
        server.on('listening', async () => {
            console.info(`Server started, listening on port: ${server.address().port}.`);
        });

        const stopServer = ()  => {
            console.log('SIGTERM or SIGINT received');
            server.close(async () => {
                console.info('HTTP server stopped');
                process.exit(0);
            })
        }

        process.on('SIGTERM', stopServer);
        process.on('SIGINT', stopServer);

        server.listen(LISTENER_PORT);

    } catch (err) {
        console.error('ERROR STARTING SERVER');
        console.error(err);
        process.exit(1);
    }
})();