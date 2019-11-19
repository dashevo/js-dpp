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
    this.publicKeyId = null;
    this.signature = null;
    this.userId = null;
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
        publicKeyId: this.getPublicKeyId(),
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
   * @return {string|null}
   */
  getSignature() {
    return this.signature;
  }

  /**
   * Returns public key id
   *
   * @returns {number|null}
   */
  getPublicKeyId() {
    return this.publicKeyId;
  }

  /**
   * Returns user id
   *
   * @returns {string|null}
   */
  getUserId() {
    return this.userId;
  }

  /**
   * Sign data with privateKey
   *
   * @param {{id: number, userId: string, type: number, privateKey: string}} options
   * @return {Buffer}
   */
  sign(options) {
    const {
      id: publicKeyId, userId, type, privateKey,
    } = options;

    const data = this.serialize({ skipSignature: true });

    switch (type) {
      case signatureTypes.ECDSA:
        this.signature = signData(data, privateKey).toString('base64');
        break;
      default:
        throw new InvalidSignatureTypeError(type);
    }

    this.publicKeyId = publicKeyId;
    this.userId = userId;

    return this.signature;
  }

  /**
   * Verify signature with public key
   *
   * @param {Buffer|string} publicKeyHash
   * @return {boolean}
   */
  verifySignature(publicKeyHash) {
    const signature = this.getSignature();
    if (!signature) {
      return false;
    }

    const data = this.serialize({ skipSignature: true });

    try {
      return verifyDataSignature(data, Buffer.from(signature, 'base64'), publicKeyHash);
    } catch (e) {
      return false;
    }
  }
}

module.exports = AbstractStateTransition;
