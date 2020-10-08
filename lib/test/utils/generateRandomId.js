const crypto = require('crypto');
const Identifier = require('../../Identifier');

/**
 * Generate random identity ID
 *
 * @return {Identifier}
 */
function generateRandomId() {
  const randomBytes = crypto.randomBytes(36);

  return new Identifier(
    crypto.createHash('sha256').update(randomBytes).digest(),
  );
}

module.exports = generateRandomId;
