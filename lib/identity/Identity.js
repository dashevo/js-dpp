const hash = require('../util/hash');
const { encode } = require('../util/serializer');
const stateTransitionTypes = require('../stateTransition/stateTransitionTypes');
const WrongStateTransitionTypeError = require('./errors/WrongStateTransitionTypeError');
const PublicKey = require('./PublicKey');

/**
 * @class
 * @property {string} id
 * @property {number} type
 * @property {PublicKey[]} publicKeys
 */
class Identity {
  /**
   * @param {RawIdentity} [rawIdentity]
   */
  constructor(rawIdentity = undefined) {
    this.publicKeys = [];

    if (rawIdentity) {
      this
        .setId(rawIdentity.id)
        .setType(rawIdentity.type);

      if (rawIdentity.publicKeys) {
        this.setPublicKeys(
          rawIdentity.publicKeys.map(rawPublicKey => new PublicKey(rawPublicKey)),
        );
      }
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
        throw new Error('Can\'t apply identity create state transition to already existing model');
      }

      this
        .setId(stateTransition.getIdentityId())
        .setType(stateTransition.getIdentityType())
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
   * @param {number} type
   * @return {Identity}
   */
  setType(type) {
    this.type = type;

    return this;
  }

  /**
   * @return {number}
   */
  getType() {
    return this.type;
  }

  /**
   * @param {PublicKey[]} publicKeys
   * @return {Identity}
   */
  setPublicKeys(publicKeys) {
    this.publicKeys = publicKeys;

    return this;
  }

  /**
   * @return {PublicKey[]}
   */
  getPublicKeys() {
    return this.publicKeys;
  }

  /**
   * Returns a public key for a given id
   *
   * @param {number} keyId
   * @return {RawPublicKey}
   */
  getPublicKeyById(keyId) {
    return this.publicKeys.find(publicKey => publicKey.getId() === keyId);
  }

  /**
   * @return {RawIdentity}
   */
  toJSON() {
    return {
      id: this.getId(),
      type: this.getType(),
      publicKeys: this.getPublicKeys()
        .map(publicKey => publicKey.toJSON()),
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
    return hash(this.serialize())
      .toString('hex');
  }
}

Identity.TYPES = {
  USER: 1,
  APPLICATION: 2,
};

Identity.MAX_RESERVED_TYPE = 32767;

Identity.TYPES_ENUM = Object
  .keys(Identity.TYPES)
  .map(typeName => Identity.TYPES[typeName]);

module.exports = Identity;
