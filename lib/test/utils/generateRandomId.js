const crypto = require('crypto');
const Identifier = require('../../Identifier');

/**
 * Generate random identity ID
 *
 * @return {EncodedBuffer}
 */
function generateRandomId() {
  const randomBytes = crypto.randomBytes(36);

  return new Identifier(
    crypto.createHash('sha256').update(randomBytes).digest(),
    Identifier.ENCODING.BASE58,
  );
}

module.exports = generateRandomId;
