'use strict'

/*
 * set environment variables to use when running tests
*/
const path = require('path');
const fs = require('fs');
const debug = require('debug')('chordsGenius.tests:loadConfig')

const envConfig = require('dotenv').parse(fs.readFileSync(path.resolve(__dirname, './.env-test')));

const envInfo = [];
for (const k in envConfig) {
    process.env[k] = envConfig[k];
    envInfo.push(`process.env.${k} = ${process.env[k]}`);
}

debug('Environment loaded: %o', envInfo);