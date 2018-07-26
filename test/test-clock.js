'use strict';

const moment = require('moment-timezone');
const sinon = require('sinon');

class TestClock {

  constructor() {
    this.initialized = false;
    this.clock = null;
  }

  setup(time, timezone) {
    this.initialized = true;
    this.clock = sinon.useFakeTimers(moment.utc(time).valueOf()); // eslint-disable-line no-undef
    moment.tz.setDefault(timezone);
  }

  teardown() {
    if (!this.initialized) return;
    this.initialized = false;
    this.clock.restore();
    moment.tz.setDefault(null);
  }

}

module.exports = TestClock;
