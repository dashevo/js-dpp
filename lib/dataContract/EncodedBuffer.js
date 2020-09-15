const bs58 = require('bs58');
const encodeToBase64WithoutPadding = require('../util/encodeToBase64WithoutPadding');
const InvalidBufferEncodingError = require('../errors/InvalidBufferEncodingError');

class EncodedBuffer {
  /**
   *
   * @param {Buffer} buffer
   * @param {EncodedBufferEncoding} encoding
   */
  constructor(buffer, encoding) {
    switch (encoding) {
      case EncodedBuffer.ENCODING.BASE64:
      case EncodedBuffer.ENCODING.BASE58:
        this.buffer = buffer;
        break;
      default:
        throw new InvalidBufferEncodingError(encoding);
    }

    this.encoding = encoding;
  }

  /**
   * Get buffer encoding
   *
   * @return {EncodedBufferEncoding}
   */
  getEncoding() {
    return this.encoding;
  }

  /**
   * Convert to buffer
   *
   * @return {Buffer}
   */
  toBuffer() {
    return this.buffer;
  }

  /**
   * Encode CBOR
   *
   * @param {Encoder} encoder
   * @return {boolean}
   */
  encodeCBOR(encoder) {
    encoder.push(this.toBuffer());

    return true;
  }

  /**
   * Convert to string
   *
   * @return {string}
   */
  toString() {
    const encoding = this.getEncoding();

    switch (this.getEncoding()) {
      case EncodedBuffer.ENCODING.BASE64:
        return encodeToBase64WithoutPadding(this.buffer);
      case EncodedBuffer.ENCODING.BASE58:
        return bs58.encode(this.buffer);
      default:
        throw new InvalidBufferEncodingError(encoding);
    }
  }

  /**
   * Convert from string to EncodedBuffer class
   *
   * @param {string} string
   * @param {EncodedBufferEncoding} encoding
   * @return {EncodedBuffer}
   */
  static fromString(string, encoding) {
    let buffer;

    switch (encoding) {
      case EncodedBuffer.ENCODING.BASE64:
        buffer = Buffer.from(string, 'base64');
        break;
      case EncodedBuffer.ENCODING.BASE58:
        buffer = bs58.decode(string);
        break;
      default:
        throw new InvalidBufferEncodingError(encoding);
    }

    return new EncodedBuffer(buffer, encoding);
  }
}

/**
 * @readonly
 * @enum {EncodedBufferEncoding}
 * @typedef {string} EncodedBufferEncoding
 */
EncodedBuffer.ENCODING = {
  BASE58: 'base58',
  BASE64: 'base64',
};

module.exports = EncodedBuffer;
