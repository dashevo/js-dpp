const blake3 = require('blake3');

/**
 * Serialize and hash payload using blake 3
 *
 * @param {Buffer} buffer
 * @return {Buffer}
 */
module.exports = function hash(buffer) {
  return blake3.hash(buffer);
};
