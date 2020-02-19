const cbor = require('cbor');

const DataSerializationError = require('./errors/DataSerializationError');

const MAX_ENCODED_BYTE_LENGTH = 16 * 1024; // 16Kb

/**
 * @typedef serializer
 * @type {{encode(*): Buffer, decode((Buffer|string)): *}}
 */
module.exports = {
  /**
   *
   * @param {*} payload
   * @return {Buffer}
   */
  encode(payload) {
    const encodedData = cbor.encodeCanonical(payload);
    const encodedDataByteLength = Buffer.byteLength(encodedData);

    if (encodedDataByteLength >= MAX_ENCODED_BYTE_LENGTH) {
      throw new DataSerializationError(
        'CBOR reached a 16Kb limit while encoding data. Data is too big.', payload,
      );
    }

    return encodedData;
  },

  /**
   *
   * @param {Buffer|string} payload
   */
  decode(payload) {
    return cbor.decode(payload);
  },
};
