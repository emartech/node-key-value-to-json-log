'use strict';

const Transformer = require('./transformer');
const jsonLoggerFactory = require('@emartech/json-logger');
const jsonLogger = jsonLoggerFactory.Logger;


describe('KeyValueToJsonLogTransformer', function() {

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
    }
  ].forEach(function(data, index) {
    it(`converts the incoming log level log to proper JSON format #${index} `, function() {
      instance.transform(data.input);

      expect(jsonLoggerFormatter).to.have.been.calledWithExactly(data.expectedJsonLoggerLogArguments);
    });
  });

});
