const blake3Promise = require('blake3/dist/node');

let blake3 = {};
/**
 * Init the blake 3 hasher
 * @returns {Promise<void>}
 */
async function initBlake3() {
  blake3 = await blake3Promise;
}

/**
 * Serialize and hash payload using blake 3
 *
 * @param {Buffer} buffer
 * @return {Buffer}
 */
function hash(buffer) {
  return blake3.hash(buffer);
}

module.exports = {
  initBlake3,
  hash,
};
