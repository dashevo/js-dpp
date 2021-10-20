const blake3 = require('blake3');
const crypto = require('crypto');

/**
 * Serialize buffer using sha-256
 * @param {Buffer} payload
 * @returns {Buffer}
 */
function sha256(payload) {
  return crypto.createHash('sha256')
    .update(payload)
    .digest();
}

/**
 * Serialzie data using double sha-256
 * @param {Buffer} payload
 * @returns {Buffer}
 */
function doubleSHA256(payload) {
  return sha256(sha256(payload));
}

module.exports = {
  doubleSHA256,
  blake3: blake3.hash,
};
