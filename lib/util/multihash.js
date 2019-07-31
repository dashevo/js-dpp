const multihashes = require('multihashes');

function multihash(payload) {
  return multihashes.encode(payload, 'dbl-sha2-256');
}

function validate(hash) {
  try {
    multihashes.validate(hash);
  } catch (e) {
    return false;
  }

  return true;
}

module.exports = multihash;
module.exports.validate = validate;
