const { HashSigner } = require('@dashevo/dashcore-lib');
const hash = require('../../util/hash');
const AbstractStateTransition = require('../../stateTransition/AbstractStateTransition');
const stateTransitionTypes = require('../../stateTransition/stateTransitionTypes');
const { IDENTITY_TYPES } = require('../constants');

/**
 * @class
 * @extends AbstractStateTransition
 * @property {number} identityCreateStateTransitionVersion
 * @property {string} lockedOutPoint
 * @property {number} identityType
 * @property {RawPublicKey[]} publicKeys
 * @property {string} ownershipProofSignature
 * @property {string} identityId - calculated identity id. This field is not serialized
 */
class IdentityCreateStateTransition extends AbstractStateTransition {
  static getCurrentIdentityCreateSTVersion() {
    return IdentityCreateStateTransition.DEFAULTS.CURRENT_VERSION;
  }

  /**
   * @param {RawIdentityCreateStateTransition} [rawIdentityCreateStateTransition]
   */
  constructor(rawIdentityCreateStateTransition) {
    super();

    if (rawIdentityCreateStateTransition) {
      this
        .setIdentityStateTransitionVersion(
          rawIdentityCreateStateTransition.identityCreateStateTransitionVersion,
        )
        .setIdentityType(rawIdentityCreateStateTransition.identityType)
        .setLockedOutPoint(rawIdentityCreateStateTransition.lockedOutPoint)
        .setPublicKeys(rawIdentityCreateStateTransition.publicKeys)
        .setOwnershipProofSignature(rawIdentityCreateStateTransition.ownershipProofSignature);
    } else {
      this
        .setIdentityStateTransitionVersion(
          IdentityCreateStateTransition.getCurrentIdentityCreateSTVersion(),
        )
        .setIdentityType(IdentityCreateStateTransition.IdentityTypes.DEFAULT)
        .setPublicKeys([]);
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
   * @param {number} identityStateTransitionVersion
   * @return {IdentityCreateStateTransition}
   */
  setIdentityStateTransitionVersion(identityStateTransitionVersion) {
    this.identityCreateStateTransitionVersion = identityStateTransitionVersion;

    return this;
  }

  getIdentityStateTransitionVersion() {
    return this.identityCreateStateTransitionVersion;
  }

  /**
   * Sets an outPoint. OutPoint is a pointer to the output funding identity creation.
   * Its hash also serves as an identity id.
   * More about the OutPoint can be found in the identity documentation
   * @param {string} lockedOutPoint
   * @return {IdentityCreateStateTransition}
   */
  setLockedOutPoint(lockedOutPoint) {
    this.lockedOutPoint = lockedOutPoint;
    this.identityId = hash(Buffer.from(lockedOutPoint, 'base64'))
      .toString('base64');

    return this;
  }

  /**
   * @return {string}
   */
  getLockedOutPoint() {
    return this.lockedOutPoint;
  }

  /**
   * Sets the identity type.
   * For more info please check identity documentation
   * @param {number} identityType
   * @return {IdentityCreateStateTransition}
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
   * @return {RawPublicKey[]}
   */
  getPublicKeys() {
    return this.publicKeys;
  }

  /**
   * Replaces existing set of public keys with a new one
   * @param newPublicKeys
   * @return {IdentityCreateStateTransition}
   */
  setPublicKeys(newPublicKeys) {
    this.publicKeys = newPublicKeys;

    return this;
  }

  /**
   * Adds public keys to the existing public keys array
   * @param {RawPublicKey[]} publicKeys
   * @return {IdentityCreateStateTransition}
   */
  addPublicKeys(publicKeys) {
    this.publicKeys.push(...publicKeys);

    return this;
  }

  /**
   * Signs OutPoint hash and sets ownershipProofSignature
   * @param {string} privateKey
   * @return {IdentityCreateStateTransition}
   */
  signOwnershipProof(privateKey) {
    this.setOwnershipProofSignature(
      HashSigner.signData(
        Buffer.from(this.lockedOutPoint, 'base64'),
        privateKey,
      ),
    );

    return this;
  }

  /**
   * @param {string|Buffer} publicKeyHash
   * @return {boolean}
   */
  verifyOwnershipProofSignature(publicKeyHash) {
    return HashSigner.verifyDataSignature(
      Buffer.from(this.lockedOutPoint, 'base64'),
      Buffer.from(this.ownershipProofSignature, 'base64'),
      publicKeyHash,
    );
  }

  /**
   * @param {string} ownershipProofSignature
   * @return {IdentityCreateStateTransition}
   */
  setOwnershipProofSignature(ownershipProofSignature) {
    this.ownershipProofSignature = ownershipProofSignature;

    return this;
  }

  /**
   * @return {string}
   */
  getOwnershipProofSignature() {
    return this.ownershipProofSignature;
  }

  /**
   * Returns base64 representation of the future identity id
   *
   * @return {string}
   */
  getIdentityId() {
    return this.identityId;
  }

  /**
   * Get Documents State Transition as plain object
   *
   * @return {RawIdentityCreateStateTransition}
   */
  toJSON() {
    return {
      ...super.toJSON(),
      identityCreateStateTransitionVersion: this.getIdentityStateTransitionVersion(),
      identityType: this.getIdentityType(),
      lockedOutPoint: this.getLockedOutPoint(),
      publicKeys: this.getPublicKeys(),
      ownershipProofSignature: this.getOwnershipProofSignature(),
    };
  }
}

IdentityCreateStateTransition.IdentityTypes = IDENTITY_TYPES;

IdentityCreateStateTransition.DEFAULTS = {
  CURRENT_VERSION: 0,
};

module.exports = IdentityCreateStateTransition;
