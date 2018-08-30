#!/usr/bin/env node

"use strict";

const logTransformer = require('./transformer').create();
const transformStreamFactory = require('./transform-stream-factory');

const transformStream = transformStreamFactory(logTransformer.transform);

process.stdin.pipe(transformStream);
