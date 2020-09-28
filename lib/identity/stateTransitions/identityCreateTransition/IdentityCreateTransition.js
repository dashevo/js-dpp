const hash = require('../../../util/hash');
const AbstractStateTransition = require('../../../stateTransition/AbstractStateTransition');
const stateTransitionTypes = require('../../../stateTransition/stateTransitionTypes');
const IdentityPublicKey = require('../../IdentityPublicKey');
const EncodedBuffer = require('../../../util/encoding/EncodedBuffer');

class IdentityCreateTransition extends AbstractStateTransition {
  /**
   * @param {RawIdentityCreateTransition} [rawIdentityCreateTransition]
   */
  constructor(rawIdentityCreateTransition) {
    super(rawIdentityCreateTransition);

    this.publicKeys = [];

    if (rawIdentityCreateTransition) {
      if (rawIdentityCreateTransition.publicKeys) {
        this.setPublicKeys(
          rawIdentityCreateTransition.publicKeys
            .map((rawPublicKey) => new IdentityPublicKey(rawPublicKey)),
        );
      }

      this
        .setLockedOutPoint(rawIdentityCreateTransition.lockedOutPoint);
    }
  }

  /**
   * Get State Transition type
   *
   * @return {number}
   */
  getType() {
    return stateTransitionTypes.IDENTITY_CREATE;
  }

  /**
   * Sets an outPoint. OutPoint is a pointer to the output funding identity creation.
   * Its hash also serves as an identity id.
   * More about the OutPoint can be found in the identity documentation
   * @param {Buffer} lockedOutPoint
   * @return {IdentityCreateTransition}
   */
  setLockedOutPoint(lockedOutPoint) {
    this.lockedOutPoint = EncodedBuffer.from(lockedOutPoint, EncodedBuffer.ENCODING.BASE64);
    this.identityId = new EncodedBuffer(
      hash(this.lockedOutPoint.toBuffer()),
      EncodedBuffer.ENCODING.BASE58,
    );

    return this;
  }

  /**
   * @return {EncodedBuffer}
   */
  getLockedOutPoint() {
    return this.lockedOutPoint;
  }

  /**
   * @return {IdentityPublicKey[]}
   */
  getPublicKeys() {
    return this.publicKeys;
  }

  /**
   * Replaces existing set of public keys with a new one
   * @param {IdentityPublicKey[]} publicKeys
   * @return {IdentityCreateTransition}
   */
  setPublicKeys(publicKeys) {
    this.publicKeys = publicKeys;

    return this;
  }

  /**
   * Adds public keys to the existing public keys array
   * @param {IdentityPublicKey[]} publicKeys
   * @return {IdentityCreateTransition}
   */
  addPublicKeys(publicKeys) {
    this.publicKeys.push(...publicKeys);

    return this;
  }

  /**
   * Returns base58 representation of the future identity id
   *
   * @return {EncodedBuffer}
   */
  getIdentityId() {
    return this.identityId;
  }

  /**
   * Returns Owner ID
   *
   * @return {EncodedBuffer}
   */
  getOwnerId() {
    return this.identityId;
  }

  /**
   * Get state transition as plain object
   *
   * @param {Object} [options]
   * @param {boolean} [options.skipSignature]
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
      ...super.toObject(options),
      lockedOutPoint: this.getLockedOutPoint(),
      publicKeys: this.getPublicKeys().map((publicKey) => publicKey.toObject(options)),
    };

    if (!options.encodedBuffer) {
      plainObject = {
        ...plainObject,
        lockedOutPoint: plainObject.lockedOutPoint.toBuffer(),
      };
    }

    return plainObject;
  }

  /**
   * Get state transition as JSON
   *
   * @param {Object} [options]
   * @return {Object}
   */
  toJSON(options = {}) {
    const rawTransition = super.toJSON({
      ...options,
      encodedBuffer: true,
    });

    return {
      ...rawTransition,
      lockedOutPoint: rawTransition.lockedOutPoint.toString(),
      publicKeys: this.getPublicKeys().map((publicKey) => publicKey.toJSON()),
    };
  }

  /**
   * Create state transition from JSON
   *
   * @param {RawIdentityCreateTransition} rawStateTransition
   *
   * @return {IdentityCreateTransition}
   */
  static fromJSON(rawStateTransition) {
    return new IdentityCreateTransition(
      AbstractStateTransition.translateJsonToObject(rawStateTransition),
    );
  }
}

/**
 * @typedef {Object} RawIdentityCreateTransition
 * @extends AbstractStateTransition
 * @property {number} protocolVersion
 * @property {number} type
 * @property {Buffer} lockedOutPoint
 * @property {RawIdentityPublicKey[]} publicKeys
 * @property {number|null} signaturePublicKeyId
 * @property {buffer|string|null} signature
 */

module.exports = IdentityCreateTransition;
