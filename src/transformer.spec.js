'use strict';

const jsonLoggerFactory = require('@emartech/json-logger');
const Transformer = require('./transformer');

const jsonLogger = jsonLoggerFactory.Logger;

describe('Transformer', function() {

  let oldJsonLoggerOutput;
  let oldJsonLoggerFormatter;

  beforeEach('backup modified logger functions', function() {
    oldJsonLoggerOutput = jsonLogger.config.output;
    oldJsonLoggerFormatter = jsonLogger.config.formatter;
  });

  afterEach('restore modified logger functions', function() {
    jsonLogger.config.output = oldJsonLoggerOutput;
    jsonLogger.config.formatter = oldJsonLoggerFormatter;
  });


  let jsonLoggerFormatter;
  let jsonLoggerOutput;

  const instance = Transformer.create();

  beforeEach(function() {
    this.clock.setup('2018-05-11 15:00:00');

    jsonLoggerFormatter = jsonLogger.config.formatter = this.sandbox.spy();
    jsonLoggerOutput = jsonLogger.config.output = this.sandbox.spy();
  });

  [
    {
      input: '\u001b[35;1mtest \u001b[0mtype="test" event="testEvent"',
      expectedJsonLoggerLogArguments: {
        name: 'test',
        action: 'testEvent',
        level: 20,
        time: '2018-05-11T15:00:00.000Z'
      }
    },
    {
      input: '\u001b[35;1mtest \u001b[0mtype="test" event="testEvent" result="success"',
      expectedJsonLoggerLogArguments: {
        name: 'test',
        action: 'testEvent',
        level: 30,
        time: '2018-05-11T15:00:00.000Z'
      }
    },
    {
      input: '\u001b[35;1mtest \u001b[0mtype="test" event="testEvent" result="error" errorMessage="this is the error message"',
      expectedJsonLoggerLogArguments: {
        name: 'test',
        error_message: 'this is the error message',
        action: 'testEvent',
        level: 50,
        time: '2018-05-11T15:00:00.000Z'
      }
    },
    {
      input: '\u001b[35;1mtest \u001b[0mtype="test" event="testEvent"  foo="bar" baz="woo" space="this is content"',
      expectedJsonLoggerLogArguments: {
        name: 'test',
        action: 'testEvent',
        level: 20,
        time: '2018-05-11T15:00:00.000Z',
        foo: 'bar',
        baz: 'woo',
        space: 'this is content'
      }
    },
    {
      input: '\u001b[35;1mtest \u001b[0mtype="test" event="testEvent"  json="{\\"foo\\":\\"s\\",\\"bar\\":\\"got \\\\\\"this\\\\\\" here\\"}"',
      expectedJsonLoggerLogArguments: {
        name: 'test',
        action: 'testEvent',
        level: 20,
        time: '2018-05-11T15:00:00.000Z',
        json: '{"foo":"s","bar":"got \\"this\\" here"}'
      }
    },
    {
      input: 'Fri, 11 May 2018 15:00:00 GMT other-namespace type="other-namespace" event="testEvent"',
      expectedJsonLoggerLogArguments: {
        name: 'other-namespace',
        action: 'testEvent',
        level: 20,
        time: '2018-05-11T15:00:00.000Z'
      }
    },
    {
      input: 'Wed, 16 May 2018 14:56:23 GMT unified-metrics-request type="unified-metrics-request" event="response-error" result="error" errorMessage="Error in http response (status: 503)" stack="[stack]" message="Error in http response (status: 503)" name="SuiteRequestError" code="503" data="The server was not able to produce a timely response to your request.\r\nPlease try again in a short while!" customer_id="537745392"',
      expectedJsonLoggerLogArguments: {
        name: 'unified-metrics-request',
        action: 'response-error',
        level: 50,
        time: '2018-05-11T15:00:00.000Z',
        error_message: 'Error in http response (status: 503)',
        error_name: 'SuiteRequestError',
        error_code: 503,
        error_stack: '[stack]',
        data: 'The server was not able to produce a timely response to your request.\r\nPlease try again in a short while!',
        customer_id: 537745392
      }
    }
  ].forEach(function(data, index) {
    it(`converts the incoming log level log to proper JSON format #${index} `, function() {
      instance.transform(data.input);

      expect(jsonLoggerFormatter).to.have.been.calledWithExactly(data.expectedJsonLoggerLogArguments);
    });
  });

  it('just send to output if JSON message is received', function() {
    const logMessage = JSON.stringify({ this: 'is', valid: 'JSON' });

    instance.transform(logMessage + "\n");

    expect(jsonLoggerFormatter).to.not.have.been.called;
    expect(jsonLoggerOutput).to.have.been.calledWithExactly(logMessage);
  });

  it('just send to output if KEY_VALUE_TO_JSON_LOG_SKIP_TRANSFORM env var is present', function() {
    process.env.KEY_VALUE_TO_JSON_LOG_SKIP_TRANSFORM = 1;

    const logMessage = 'this should be the output';

    instance.transform(logMessage + "\n");

    expect(jsonLoggerFormatter).to.not.have.been.called;
    expect(jsonLoggerOutput).to.have.been.calledWithExactly('this should be the output');

    delete process.env.KEY_VALUE_TO_JSON_LOG_SKIP_TRANSFORM;
  });

  it('converts numbers to int in message', function() {
    instance.transform('Fri, 11 May 2018 15:00:00 GMT test type="test" event="testEvent" number=10 float=5.5');

    expect(jsonLoggerFormatter).to.have.been.calledWithExactly({
      name: 'test',
      action: 'testEvent',
      level: 20,
      time: '2018-05-11T15:00:00.000Z',
      number: 10,
      float: 5.5
    });
  });

});
