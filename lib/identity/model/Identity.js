const hash = require('../../util/hash');
const { encode } = require('../../util/serializer');
const stateTransitionTypes = require('../../stateTransition/stateTransitionTypes');
const WrongStateTransitionTypeError = require('../errors/WrongStateTransitionTypeError');

/**
 * @class
 * @property {string} id
 * @property {number} identityType
 * @property {RawPublicKey[]} publicKeys
 */
class Identity {
  /**
   * @param {RawIdentity} [rawIdentity]
   */
  constructor(rawIdentity) {
    if (rawIdentity) {
      this
        .setId(rawIdentity.id)
        .setIdentityType(rawIdentity.identityType)
        .setPublicKeys(rawIdentity.publicKeys);
    }
  }

  /**
   * Applies a state transition to the identity model.
   * Only identity state transitions are allowed
   *
   * @param {IdentityCreateStateTransition} stateTransition
   */
  applyStateTransition(stateTransition) {
    if (stateTransition.getType() === stateTransitionTypes.IDENTITY_CREATE) {
      if (this.id || (this.publicKeys && this.publicKeys.length > 0)) {
        throw new Error("Can't apply identity create state transition to already existing model");
      }

      this
        .setId(stateTransition.getIdentityId())
        .setIdentityType(stateTransition.getIdentityType())
        .setPublicKeys(stateTransition.getPublicKeys());

      return this;
    }

    throw new WrongStateTransitionTypeError(stateTransition);
  }

  /**
   * @param {string} id
   * @return {Identity}
   */
  setId(id) {
    this.id = id;
    return this;
  }

  /**
   * @return {string}
   */
  getId() {
    return this.id;
  }

  /**
   * @param {number} identityType
   * @return {Identity}
   */
  setIdentityType(identityType) {
    this.identityType = identityType;

    return this;
  }

  /**
   * @return {number}
   */
  getIdentityType() {
    return this.identityType;
  }

  /**
   * @param {RawPublicKey[]} publicKeys
   * @return {Identity}
   */
  setPublicKeys(publicKeys) {
    this.publicKeys = publicKeys;

    return this;
  }

  /**
   * @return {RawPublicKey[]}
   */
  getPublicKeys() {
    return this.publicKeys;
  }

  /**
   * Returns a public key for a given id
   *
   * @param keyId
   * @return {RawPublicKey}
   */
  getPublicKeyById(keyId) {
    return this.publicKeys.find(publicKey => publicKey.id === keyId);
  }

  /**
   * @return {RawIdentity}
   */
  toJSON() {
    return {
      id: this.getId(),
      identityType: this.getIdentityType(),
      publicKeys: this.getPublicKeys(),
    };
  }

  /**
   * @return {Buffer}
   */
  serialize() {
    return encode(this.toJSON());
  }

  /**
   * @return {string}
   */
  hash() {
    return hash(this.serialize()).toString('hex');
  }
}

Identity.TYPES = {
  USER: 0,
  APPLICATION: 1,
};

Identity.MAX_RESERVED_TYPE = 32767;

Identity.TYPES_ENUM = Object
  .keys(Identity.TYPES)
  .map(typeName => Identity.TYPES[typeName]);

module.exports = Identity;
