const {
  PublicKey,
  PrivateKey,
  Signer: { sign, verifySignature },
} = require('@dashevo/dashcore-lib');
const lodashCloneDeep = require('lodash.clonedeep');

const StateTransitionIsNotSignedError = require(
  './errors/StateTransitionIsNotSignedError',
);

const hash = require('../util/hash');
const { encode } = require('../util/serializer');
const EncodedBuffer = require('../util/encoding/EncodedBuffer');

const calculateStateTransitionFee = require('./calculateStateTransitionFee');

/**
 * @abstract
 */
class AbstractStateTransition {
  /**
   * @param {
   * RawDataContractCreateTransition|
   * RawDocumentsBatchTransition|
   * RawIdentityCreateTransition|
   * RawIdentityTopUpTransition
   * } [rawStateTransition]
   */
  constructor(rawStateTransition = {}) {
    this.protocolVersion = rawStateTransition.protocolVersion;

    this.signature = null;

    if (Object.prototype.hasOwnProperty.call(rawStateTransition, 'signature')) {
      this.signature = EncodedBuffer.from(
        rawStateTransition.signature,
        EncodedBuffer.ENCODING.BASE64,
      );
    }
  }

  /**
   * Get protocol version
   *
   * @return {number}
   */
  getProtocolVersion() {
    return this.protocolVersion;
  }

  /**
   * @abstract
   */
  getType() {
    throw new Error('Not implemented');
  }

  /**
   *  Returns signature
   *
   * @return {EncodedBuffer|null}
   */
  getSignature() {
    return this.signature;
  }

  /**
   * Set signature
   * @param {Buffer} signature
   * @return {AbstractStateTransition}
   */
  setSignature(signature) {
    this.signature = EncodedBuffer.from(signature, EncodedBuffer.ENCODING.BASE64);

    return this;
  }

  /**
   * Get state transition as plain object
   *
   * @param {Object} [options]
   * @param {boolean} [options.skipSignature=false]
   * @param {boolean} [options.encodedBuffer=false]
   *
   * @return {RawStateTransition}
   */
  toObject(options = {}) {
    Object.assign(
      options,
      {
        encodedBuffer: false,
        skipSignature: false,
        ...options,
      },
    );

    const rawStateTransition = {
      protocolVersion: this.getProtocolVersion(),
      type: this.getType(),
    };

    if (!options.skipSignature) {
      rawStateTransition.signature = this.getSignature();
    }

    if (!options.encodedBuffer && rawStateTransition.signature) {
      rawStateTransition.signature = this.getSignature().toBuffer();
    }

    return rawStateTransition;
  }

  /**
   * Get state transition as JSON
   *
   * @param {Object} [options]
   *
   * @return {JsonStateTransition}
   */
  toJSON(options = {}) {
    const jsonStateTransition = this.toObject({
      ...options,
      encodedBuffer: true,
    });

    if (!options.skipSignature && jsonStateTransition.signature !== null) {
      // noinspection JSValidateTypes
      jsonStateTransition.signature = jsonStateTransition.signature.toString();
    }

    return jsonStateTransition;
  }

  /**
   * Return serialized State Transition
   *
   * @param {Object} [options]
   * @return {Buffer}
   */
  serialize(options = {}) {
    return encode(this.toObject(options));
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

  /**
   * Sign data with private key
   * @param {string|Buffer|Uint8Array|PrivateKey} privateKey string must be hex or base58
   * @return {AbstractStateTransition}
   */
  signByPrivateKey(privateKey) {
    const data = this.serialize({ skipSignature: true });
    const privateKeyModel = new PrivateKey(privateKey);

    this.setSignature(sign(data, privateKeyModel));

    return this;
  }

  /**
   * Verify signature with public key
   * @param {string|Buffer|Uint8Array|PublicKey} publicKey string must be hex or base58
   * @returns {boolean}
   */
  verifySignatureByPublicKey(publicKey) {
    const signature = this.getSignature();
    if (!signature) {
      throw new StateTransitionIsNotSignedError(this);
    }

    const signatureBuffer = signature.toBuffer();
    const data = this.serialize({ skipSignature: true });

    const publicKeyModel = new PublicKey(publicKey, {});

    let isSignatureVerified;
    try {
      isSignatureVerified = verifySignature(data, signatureBuffer, publicKeyModel);
    } catch (e) {
      isSignatureVerified = false;
    }

    return isSignatureVerified;
  }

  /**
   * Calculate ST fee in credits
   *
   * @return {number}
   */
  calculateFee() {
    return calculateStateTransitionFee(this);
  }

  /**
   * @protected
   *
   * @param {Object} rawStateTransition
   *
   * @return {Object}
   */
  static translateJsonToObject(rawStateTransition) {
    return lodashCloneDeep(rawStateTransition);
  }
}

/**
 * @typedef RawStateTransition
 * @property {number} protocolVersion
 * @property {number} type
 * @property {Buffer|null} signature
 */

/**
 * @typedef JsonStateTransition
 * @property {number} protocolVersion
 * @property {number} type
 * @property {string|null} signature
 */

AbstractStateTransition.ENCODED_PROPERTIES = {
  signature: {
    contentEncoding: 'base64',
  },
};

module.exports = AbstractStateTransition;
