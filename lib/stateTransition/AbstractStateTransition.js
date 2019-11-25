const {
  PublicKey,
  PrivateKey,
  HashSigner: { signData, verifyDataSignature },
} = require('@dashevo/dashcore-lib');

const hash = require('../util/hash');
const { encode } = require('../util/serializer');
const IdentityPublicKey = require('../identity/IdentityPublicKey');
const InvalidSignatureTypeError = require('./errors/InvalidSignatureTypeError');
const InvalidSignaturePublicKeyError = require('./errors/InvalidSignaturePublicKeyError');

/**
 * @abstract
 */
class AbstractStateTransition {
  constructor() {
    this.signaturePublicKeyId = null;
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
        signaturePublicKeyId: this.getSignaturePublicKeyId(),
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
  getSignaturePublicKeyId() {
    return this.signaturePublicKeyId;
  }

  /**
   * Sign data with privateKey
   *
   * @param {IdentityPublicKey} identityPublicKey
   * @param {string|Buffer|Uint8Array|PrivateKey} privateKey string must be hex or base58
   * @return {AbstractStateTransition}
   */
  sign(identityPublicKey, privateKey) {
    const data = this.serialize({ skipSignature: true });
    let privateKeyModel;
    let pubKeyBase;

    switch (identityPublicKey.getType()) {
      case IdentityPublicKey.TYPES.ECDSA_SECP256K1:
        privateKeyModel = new PrivateKey(privateKey);

        this.signature = signData(data, privateKeyModel).toString('base64');

        pubKeyBase = new PublicKey({
          ...privateKeyModel.toPublicKey().toObject(),
          compressed: true,
        })
          .toBuffer()
          .toString('base64');
        break;
      default:
        throw new InvalidSignatureTypeError(identityPublicKey.getType());
    }

    if (pubKeyBase !== identityPublicKey.getData()) {
      throw new InvalidSignaturePublicKeyError(identityPublicKey.getData());
    }

    this.signaturePublicKeyId = identityPublicKey.getId();

    return this;
  }

  /**
   *
   * @param {string|Buffer|Uint8Array|PrivateKey} privateKey string must be hex or base58
   * @return {AbstractStateTransition}
   */
  signByPrivateKey(privateKey) {
    const data = this.serialize({ skipSignature: true });
    const privateKeyModel = new PrivateKey(privateKey);

    this.signature = signData(data, privateKeyModel).toString('base64');

    return this;
  }

  /**
   * Verify signature
   *
   * @param {IdentityPublicKey} publicKey
   * @return {boolean}
   */
  verifySignature(publicKey) {
    const signature = this.getSignature();
    if (!signature) {
      return false;
    }

    const data = this.serialize({ skipSignature: true });

    try {
      const publicKeyBuffer = Buffer.from(publicKey.getData(), 'base64');
      // eslint-disable-next-line no-underscore-dangle
      const publicKeyHash = new PublicKey(publicKeyBuffer)._getID();

      return verifyDataSignature(
        data,
        Buffer.from(signature, 'base64'),
        publicKeyHash,
      );
    } catch (e) {
      return false;
    }
  }

  /**
   * Verify signature with public key
   * @param {string} publicKey
   * @returns {boolean}
   */
  verifySignatureByPublicKey(publicKey) {
    const signature = this.getSignature();
    if (!signature) {
      return false;
    }
    const data = this.serialize({ skipSignature: true });

    try {
      const publicKeyBuffer = Buffer.from(publicKey, 'base64');

      // eslint-disable-next-line no-underscore-dangle
      const publicKeyHash = new PublicKey(publicKeyBuffer)._getID();

      return verifyDataSignature(
        data,
        Buffer.from(signature, 'base64'),
        publicKeyHash,
      );
    } catch (e) {
      return false;
    }
  }

  /**
   * Set signature
   * @param {string|null} [signature]
   * @return {AbstractStateTransition}
   */
  setSignature(signature = null) {
    this.signature = signature;

    return this;
  }

  /**
   * Set signature public key id
   * @param {number|null} [signaturePublicKeyId]
   * @return {AbstractStateTransition}
   */
  setSignaturePublicKeyId(signaturePublicKeyId = null) {
    this.signaturePublicKeyId = signaturePublicKeyId;

    return this;
  }
}

module.exports = AbstractStateTransition;
