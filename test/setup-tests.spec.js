'use strict';

const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const TestClock = require('./test-clock');


before(function() {
  chai.use(sinonChai);
});

beforeEach(function() {
  this.sinon = sinon;
  global.expect = chai.expect;
  this.sandbox = this.sinon.createSandbox();
  this.clock = new TestClock(this.sinon);
});

afterEach(function() {
  this.sandbox.restore();
  this.clock.teardown();
});

