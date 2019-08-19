const multihashes = require('multihashes');

/**
 * Hash payload using multihash
 *
 * @param {Buffer} payload
 *
 * @return {Buffer}
 */
function hash(payload) {
  return multihashes.encode(payload, 'dbl-sha2-256');
}

/**
 * Validate hash is a valid multihash
 *
 * @param {string} hashString
 *
 * @return {boolean}
 */
function validate(hashString) {
  try {
    multihashes.validate(hashString);
  } catch (e) {
    return false;
  }

  return true;
}

module.exports = {
  hash,
  validate,
};
