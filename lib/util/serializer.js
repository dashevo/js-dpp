const cbor = require('cbor');

/**
 * @typedef serializer
 * @type {{encode(*): Buffer, decode((Buffer|string)): *}}
 */
module.exports = {
  /**
   * @param {*} payload
   * @return {Promise<Buffer>}
   */
  async encode(payload) {
    return cbor.encodeAsync(payload, {
      canonical: true,
    });
  },

  /**
   * @param {Buffer|string} payload
   * @return {Promise<*>}
   */
  async decode(payload) {
    return cbor.decodeFirst(payload, {
      canonical: true,
    });
  },
};
