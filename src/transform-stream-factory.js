const { Transform } = require('stream');

module.exports = function(transformer) {
  return new Transform({
    transform(chunk, _encoding, callback) {
      chunk.toString().split(/[\r\n]+/)
        .forEach(line => transformer(line));

      callback();
    }
  })
};
