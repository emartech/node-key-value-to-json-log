const transformStreamFactory = require('./transform-stream-factory');

describe('Transform Stream Factory', function() {
  let transformer;
  let transformStream;

  beforeEach(function() {
    transformer = this.sandbox.spy();
    transformStream = transformStreamFactory(transformer);
  });

  context('one line chunk', function() {
    it('transforms the given chunk', function() {
      transformStream.write('one line');

      expect(transformer).to.have.been.calledWith('one line');
    });
  });

  context('multi line chunk', function() {
    it('transforms the given chunk', function() {
      transformStream.write('first line\nsecond line');

      expect(transformer.firstCall).to.have.been.calledWith('first line');
      expect(transformer.secondCall).to.have.been.calledWith('second line');
    });
  });

});