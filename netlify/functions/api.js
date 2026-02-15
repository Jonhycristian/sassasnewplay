const app = require('../../backend/src/server');
const serverless = require('serverless-http');

module.exports.handler = serverless(app);
