/* eslint-disable no-console */
'use strict'
/*
  Source:
  Copyright (c) 2010-2016 James Hall, https://github.com/MrRio/jsPDF
*/

/**
 * The reference server collects and saves reference PDFs for the tests.
 */
const http = require('http');
const PORT = 9090;
const fs = require('fs');
const path = require('path');

// Create a server
const server = http.createServer((request, response) => {
  // Create the directory if it doesn't exist.
  var dir = path.dirname('./' + request.url);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {recursive: true});
  }

  const wstream = fs.createWriteStream('./' + request.url, {flags: 'w', encoding: 'binary'});
  console.log('Creating reference PDF ' + request.url + '.');
  request.on('data', (chunk) => {
    wstream.write(chunk.toString());
  });
  request.on('end', () => {
    wstream.end();
  });
  request.on('error', (err) => {
    console.error(err.stack);
  });
  response.end('Test has sent reference PDF for ' + request.url);
});

// Lets start our server
server.listen(PORT, () => {
  console.log(`Server listening on: http://localhost:${PORT}`);
});
