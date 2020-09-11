const EncodedBufferBase58 = require('./EncodedBufferBase58');
const EncodedBufferBase64 = require('./EncodedBufferBase64');
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
        this.buffer = new EncodedBufferBase64(buffer);
        break;
      case EncodedBuffer.ENCODING.BASE58:
        this.buffer = new EncodedBufferBase58(buffer);
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
    return this.buffer.toBuffer();
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
    return this.buffer.toString();
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
        buffer = EncodedBufferBase64.fromString(string).toBuffer();
        break;
      case EncodedBuffer.ENCODING.BASE58:
        buffer = EncodedBufferBase58.fromString(string).toBuffer();
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
