#!/usr/bin/env node

"use strict";

const { Transform } = require('stream');
const logTransformer = require('./transformer').create();

process.stdin.pipe(new Transform({
  transform(chunk, _encoding, callback) {
    logTransformer.transform(chunk.toString());
    callback();
  }
}));
