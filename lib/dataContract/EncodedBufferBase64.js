const encodeToBase64WithoutPadding = require('../util/encodeToBase64WithoutPadding');

class EncodedBufferBase64 {
  /**
   *
   * @param {Buffer} buffer
   */
  constructor(buffer) {
    this.buffer = buffer;
  }

  /**
   * Convert to string
   *
   * @return {string}
   */
  toString() {
    return encodeToBase64WithoutPadding(this.buffer);
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
   * Convert from string to EncodedBufferBase64 class
   *
   * @param {string} string
   * @return {EncodedBufferBase64}
   */
  static fromString(string) {
    return new EncodedBufferBase64(Buffer.from(string, 'base64'));
  }
}

module.exports = EncodedBufferBase64;
