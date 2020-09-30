const { PublicKey } = require('@dashevo/dashcore-lib');

const EncodedBuffer = require('../util/encoding/EncodedBuffer');
const EmptyPublicKeyDataError = require('./errors/EmptyPublicKeyDataError');

class IdentityPublicKey {
  /**
   * @param {RawIdentityPublicKey} [rawIdentityPublicKey]
   */
  constructor(rawIdentityPublicKey = undefined) {
    this.enabled = true;

    if (rawIdentityPublicKey) {
      this.setId(rawIdentityPublicKey.id)
        .setType(rawIdentityPublicKey.type);

      if (rawIdentityPublicKey.data) {
        this.setData(rawIdentityPublicKey.data);
      }
    }
  }

  /**
   * Get key ID
   *
   * @return {number}
   */
  getId() {
    return this.id;
  }

  /**
   * Set key ID
   *
   * @param {number} id
   * @return {IdentityPublicKey}
   */
  setId(id) {
    this.id = id;

    return this;
  }

  /**
   * Get key type
   *
   * @return {number}
   */
  getType() {
    return this.type;
  }

  /**
   * Set key type
   *
   * @param {number} type
   * @return {IdentityPublicKey}
   */
  setType(type) {
    this.type = type;

    return this;
  }

  /**
   * Set base64 encoded public key
   *
   * @param {Buffer} data
   * @return {IdentityPublicKey}
   */
  setData(data) {
    this.data = EncodedBuffer.from(data, EncodedBuffer.ENCODING.BASE64);

    return this;
  }

  /**
   * Get base64 encoded public key
   *
   * @return {EncodedBuffer}
   */
  getData() {
    return this.data;
  }

  /**
   * Get original public key hash
   *
   * @returns {string}
   */
  hash() {
    if (!this.getData()) {
      throw new EmptyPublicKeyDataError();
    }

    const originalPublicKey = new PublicKey(
      this.getData(),
    );

    return originalPublicKey.hash
      .toString('hex');
  }

  /**
   * Get plain object representation
   *
   * @param {Object} [options]
   * @param {boolean} [options.encodedBuffer=false]
   *
   * @return {Object}
   */
  toObject(options = {}) {
    Object.assign(
      options,
      {
        encodedBuffer: false,
        ...options,
      },
    );

    let plainObject = {
      id: this.getId(),
      type: this.getType(),
      data: this.getData(),
    };

    if (!options.encodedBuffer) {
      plainObject = {
        ...plainObject,
        data: plainObject.data.toBuffer(),
      };
    }

    return plainObject;
  }

  /**
   * Get JSON representation
   *
   * @return {RawIdentityPublicKey}
   */
  toJSON() {
    return {
      id: this.getId(),
      type: this.getType(),
      data: this.getData().toString(),
    };
  }
}

/**
 * @typedef {Object} RawIdentityPublicKey
 * @property {number} id
 * @property {number} type
 * @property {Buffer} data
 */

IdentityPublicKey.TYPES = {
  ECDSA_SECP256K1: 0,
  BLS12_381: 1,
};

module.exports = IdentityPublicKey;
