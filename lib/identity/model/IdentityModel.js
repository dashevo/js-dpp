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
class IdentityModel {
  /**
   * @param {RawIdentityModel} [rawIdentityModel]
   */
  constructor(rawIdentityModel) {
    if (rawIdentityModel) {
      this.id = rawIdentityModel.id;
      this.publicKeys = rawIdentityModel.publicKeys;
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

      this.id = stateTransition.getIdentityId();
      this.identityType = stateTransition.getIdentityType();
      this.publicKeys = stateTransition.getPublicKeys();

      return this;
    }

    throw new WrongStateTransitionTypeError(stateTransition);
  }

  /**
   * @return {string}
   */
  getId() {
    return this.id;
  }

  /**
   * @return {RawPublicKey[]}
   */
  getPublicKeys() {
    return this.publicKeys;
  }

  /**
   * @return {RawIdentityModel}
   */
  toJSON() {
    return {
      id: this.id,
      publicKeys: this.publicKeys,
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

module.exports = IdentityModel;
