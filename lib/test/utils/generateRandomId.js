const crypto = require('crypto');

/**
 * Generate random identity ID
 *
 * @return {Buffer}
 */
function generateRandomId() {
  const randomBytes = crypto.randomBytes(36);

  return crypto.createHash('sha256').update(randomBytes).digest();
}

module.exports = generateRandomId;
