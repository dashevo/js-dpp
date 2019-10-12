const hash = require('../util/hash');

/**
 * @abstract
 */
class AbstractStateTransition {
  /**
   * Get protocol version
   *
   * @return {number}
   */
  getProtocolVersion() {
    return 0;
  }

  /**
   * @abstract
   */
  getType() {
    throw new Error('Not implemented');
  }

  /**
   * Return serialized State Transition
   *
   * @return {Buffer}
   */
  serialize() {
    return Buffer.from('abc');
  }

  /**
   * Returns hex string with Data Contract hash
   *
   * @return {string}
   */
  hash() {
    return hash(this.serialize()).toString('hex');
  }
}

module.exports = AbstractStateTransition;
