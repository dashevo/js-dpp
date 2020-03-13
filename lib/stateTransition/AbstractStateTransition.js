const hash = require('../util/hash');
const { encode } = require('../util/serializer');

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
   * @abstract
   * @return {{protocolVersion: number, type: number}}
   */
  toJSON() {
    return {
      protocolVersion: this.getProtocolVersion(),
      type: this.getType(),
    };
  }

  /**
   * Return serialized State Transition
   *
   * @param {Object} [options]
   * @return {Buffer}
   */
  serialize(options = {}) {
    return encode(this.toJSON(options));
  }

  /**
   * Returns hex string with Data Contract hash
   *
   * @param {Object} [options]
   * @return {string}
   */
  hash(options = {}) {
    return hash(this.serialize(options)).toString('hex');
  }
}

module.exports = AbstractStateTransition;
