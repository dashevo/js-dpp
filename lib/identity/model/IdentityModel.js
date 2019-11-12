const hash = require('../../util/hash');
const { encode } = require('../../util/serializer');
const stateTransitionTypes = require('../../stateTransition/stateTransitionTypes');
const WrongStateTransitionTypeError = require('../errors/WrongStateTransitionTypeError');

/**
 * @class
 * @property {string} id
 * @property {RawPublicKey[]} publicKeys
 */
class IdentityModel {
  /**
   * @param {RawIdentityModel} rawIdentityModel
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
      throw new Error('Not implemented');
    }

    throw new WrongStateTransitionTypeError(stateTransition);
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
   * @return {string}
   */
  hash() {
    return hash(this.serialize()).toString('hex');
  }
}

module.exports = IdentityModel;
