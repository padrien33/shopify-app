#!/usr/bin/env node
/* eslint no-console: 0 */
require('dotenv').config();
const chalk = require('chalk');
const http = require('http');
const app = require('../server');

const port = process.env.SHOPIFY_APP_PORT || '3001';
app.set('port', port);

const server = http.createServer(app);

server.listen(port, (err) => {
  if (err) {
    return console.log('😫', chalk.red(err));
  }
  console.log(`🚀 listening on port:${port}`);
});
