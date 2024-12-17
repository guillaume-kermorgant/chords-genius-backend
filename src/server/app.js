'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const noCache = require('nocache');
const openapi = require('express-openapi');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();

app.use(cors());

app.use(bodyParser.json({
    limit: '1mb'
}));

app.use(helmet());
app.use('/api/*', noCache());

if (process.env.NODE_ENV === 'development') {
    const swaggerUI = require('swagger-ui-express');
    app.use(
        '/swagger-ui',
        swaggerUI.serve,
        swaggerUI.setup(null, {
            swaggerUrl: '/api/v1/api-spec'
        })
    );
}

openapi.initialize({
    apiDoc: JSON.parse(fs.readFileSync(path.resolve(__dirname, './spec/openapi.json'), 'utf8')),
    app: app,
    paths: path.resolve(__dirname, 'api/v1'),
    exposeApiDocs: (process.env.NODE_ENV === 'development'),
    docsPath: '/api-spec',
    // TODO: need global error handler here
    errorMiddleware: (err, req, res, next) => {
        console.error(`GLOBAL ERROR HANDLER:: ${JSON.stringify(err, null, 2)}`);
        res.status(err.status).json(err);
    }
})

module.exports = app;