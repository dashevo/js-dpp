const AbstractStateTransition = require('../../stateTransition/AbstractStateTransition');
const stateTransitionTypes = require('../../stateTransition/stateTransitionTypes');

/**
 * @class
 * @extends AbstractStateTransition
 * @property {number} version
 * @property {Buffer} {lockedOutPoint}
 * @property {number} identityType
 * @property {RawPublicKey[]} publicKeys
 * @property {Buffer} ownershipProofSignature
 */
class IdentityCreateStateTransition extends AbstractStateTransition {
  /**
   * @param {RawIdentityCreateStateTransition} [rawIdentityStateTransition]
   */
  constructor(rawIdentityStateTransition) {
    super();
  }

  /**
   * Get State Transition type
   *
   * @return {number}
   */
  getType() {
    return stateTransitionTypes.IDENTITY_CREATE;
  }

  setLockedOutput() {}

  getLockedOutput() {}

  setIdentityType() {}

  getIdentityType() {}

  getPublicKeys() {}

  setPublicKeys() {}

  signOwnershipProof() {}

  setOwnershipProof() {}

  getOwnershipProof() {}

  /**
   * Get Documents State Transition as plain object
   *
   * @return {RawIdentityCreateStateTransition}
   */
  toJSON() {
    return {
      ...super.toJSON(),
    };
  }
}

module.exports = IdentityCreateStateTransition;
