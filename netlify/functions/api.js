const serverless = require('serverless-http');
const app = require('../../backend/src/app');
const db = require('../../backend/src/config/db');

module.exports.handler = serverless(app);
