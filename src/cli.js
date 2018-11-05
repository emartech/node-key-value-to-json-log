#!/usr/bin/env node

"use strict";

const logTransformer = require('./transformer').create();
const transformStreamFactory = require('./transform-stream-factory');

const transformStream = transformStreamFactory(logTransformer.transform.bind(logTransformer));

process.stdin.pipe(transformStream);
