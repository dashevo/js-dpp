const bs58 = require('bs58');

class EncodedBufferBase58 {
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
    return bs58.encode(this.buffer);
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
   * Convert from string to EncodedBufferBase58 class
   *
   * @param {string} string
   * @return {EncodedBufferBase58}
   */
  static fromString(string) {
    return new EncodedBufferBase58(bs58.decode(string));
  }
}

module.exports = EncodedBufferBase58;
