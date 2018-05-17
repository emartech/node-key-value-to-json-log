'use strict';

const jsonLoggerFactory = require('@emartech/json-logger');
const logFormatter = require('logfmt');
const snakeCaseKeys = require('snakecase-keys');
const stripAnsi = require('strip-ansi');
const omit = require('lodash.omit');

const levels = require('./levels.json');


class KeyValueToJsonLogTransformer {

  static create() {
    return new this;
  }

  constructor() {
    this._loggers = {};
  }

  transform(message) {
    if (this._isItAJSONLogAlready(message)) {
      jsonLoggerFactory.Logger.config.output(message);
    }

    const { result, eventName, namespace, data } = this._getLogInfo(message);

    if (!namespace) {
      return;
    }


    this._log(namespace, eventName, data, result);
  }

  _getLogInfo(message) {
    const asciiMessage = stripAnsi(message);
    const logParts = logFormatter.parse(this._trimDatePrefix(asciiMessage).trim());

    return {
      result: logParts.result,
      eventName: logParts.event,
      namespace: logParts.type,
      data: omit(logParts, ['result', 'event', 'type', logParts.type])
    };
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
      this._loggers[namespace] = new jsonLoggerFactory.Logger(namespace, true);
    }

    return this._loggers[namespace];
  }

  _isItAJSONLogAlready(message) {
    try {
      JSON.parse(message);
      return true;
    }
    catch (e) {
      return false;
    }
  }

}

module.exports = KeyValueToJsonLogTransformer;
