'use strict';

const jsonLoggerFactory = require('@emartech/json-logger');
const logFormatter = require('logfmt');
const snakeCaseKeys = require('snakecase-keys');
const stripAnsi = require('strip-ansi');

const levels = require('./levels.json');


class KeyValueToJsonLogTransformer {

  static create() {
    return new this;
  }

  constructor() {
    this._loggers = {};
  }

  transform(message) {
    const logParts = this._getLogParts(message);

    const result = logParts.result;
    delete logParts.result;

    const eventName = logParts.event;
    delete logParts.event;

    const namespace = logParts.type;
    delete logParts[namespace];
    delete logParts.type;

    this._log(namespace, eventName, logParts, result);
  }

  _getLogParts(message) {
    const asciiMessage = stripAnsi(message);
    return logFormatter.parse(this._trimDatePrefix(asciiMessage).trim());
  }

  _trimDatePrefix(message) {
    const [, , _message] = /^([A-Za-z]{3}, \d{2} [A-Za-z]{3} \d{4} \d{2}:\d{2}:\d{2} [A-Z]+\s+)?([\s\S]+)$/.exec(message);
    return _message;
  }

  _log(namespace, action, data, level) {
    const logger = this._getLogger(namespace);
    const logMethod = levels[level || 'default'];
    logger[logMethod](action, snakeCaseKeys(data));
  }

  _getLogger(namespace) {
    if (!(namespace in this._loggers)) {
      this._loggers[namespace] = jsonLoggerFactory(namespace);
    }

    return this._loggers[namespace];
  }

}

module.exports = KeyValueToJsonLogTransformer;
