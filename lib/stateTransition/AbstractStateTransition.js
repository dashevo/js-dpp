const { HashSigner: { signData, verifyDataSignature } } = require('@dashevo/dashcore-lib');

const hash = require('../util/hash');
const { encode } = require('../util/serializer');
const signatureTypes = require('./signatureTypes');
const InvalidSignatureTypeError = require('./errors/InvalidSignatureTypeError');

/**
 * @abstract
 */
class AbstractStateTransition {
  constructor() {
    this.keyId = null;
    this.signature = null;
  }

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
   * @param {Object} [options]
   * @return {{protocolVersion: number, type: number, [sign]: string, [keyId]: number}}
   */
  toJSON(options = {}) {
    const skipSignature = !!options.skipSignature;

    let json = {
      protocolVersion: this.getProtocolVersion(),
      type: this.getType(),
    };

    if (!skipSignature) {
      json = {
        ...json,
        signature: this.getSignature(),
        keyId: this.getKeyId(),
      };
    }

    return json;
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
   * @return {string}
   */
  hash() {
    return hash(this.serialize()).toString('hex');
  }

  /**
   *  Returns signature
   *
   * @return {Buffer|null}
   */
  getSignature() {
    return this.signature;
  }

  /**
   * Returns signature type
   *
   * @returns {number|null}
   */
  getKeyId() {
    return this.keyId;
  }

  /**
   * Sign data with privateKey
   *
   * @param {{id: number, type: number, privateKey: string}} payload
   * @return {Buffer}
   */
  sign(payload) {
    const { id: keyId, type, privateKey } = payload;

    const data = this.serialize({ skipSignature: true });

    switch (type) {
      case signatureTypes.ECDSA:
        this.signature = signData(data, privateKey);
        break;
      default:
        throw new InvalidSignatureTypeError(type);
    }

    this.keyId = keyId;

    return this.signature;
  }

  /**
   * Verify signature with public key
   *
   * @param {Buffer|string} publicKeyId
   * @return {boolean}
   */
  verifySignature(publicKeyId) {
    const signature = this.getSignature();
    if (!signature) {
      return false;
    }

    const data = this.serialize({ skipSignature: true });

    return verifyDataSignature(data, signature, publicKeyId);
  }
}

module.exports = AbstractStateTransition;
