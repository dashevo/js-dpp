const { HashSigner } = require('@dashevo/dashcore-lib');
const AbstractStateTransition = require('../../stateTransition/AbstractStateTransition');
const stateTransitionTypes = require('../../stateTransition/stateTransitionTypes');
const IdentityTypes = require('../identityTypes');

/**
 * @class
 * @extends AbstractStateTransition
 * @property {number} identityCreateStateTransitionVersion
 * @property {Buffer} lockedOutPoint
 * @property {number} identityType
 * @property {RawPublicKey[]} publicKeys
 * @property {Buffer} ownershipProofSignature
 */
class IdentityCreateStateTransition extends AbstractStateTransition {
  static getCurrentIdentityCreateStateTransitionVersion() {
    return 0;
  }

  /**
   * @param {RawIdentityCreateStateTransition} [rawIdentityStateTransition]
   */
  constructor(rawIdentityStateTransition) {
    super();

    if (rawIdentityStateTransition) {
      this
        .setIdentityStateTransitionVersion(
          rawIdentityStateTransition.identityCreateStateTransitionVersion,
        )
        .setIdentityType(rawIdentityStateTransition.identityType)
        .setLockedOutPoint(rawIdentityStateTransition.lockedOutPoint)
        .setPublicKeys(rawIdentityStateTransition.publicKeys)
        .setOwnershipProofSignature(rawIdentityStateTransition.ownershipProofSignature);
    } else {
      this
        .setIdentityStateTransitionVersion(
          IdentityCreateStateTransition.getCurrentIdentityCreateStateTransitionVersion(),
        )
        .setIdentityType(IdentityTypes.DEFAULT)
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
   * Sets an outPoint. OutPoint is a poiner to the output funding identity creation.
   * Its hash also serves as an identity id.
   * More about the OutPoint can be found in the identity documentation
   * @param {Buffer} lockedOutPoint
   * @return {IdentityCreateStateTransition}
   */
  setLockedOutPoint(lockedOutPoint) {
    this.lockedOutPoint = lockedOutPoint;

    return this;
  }

  /**
   * @return {Buffer}
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
   * @return {IdentityCreateStateTransition}
   */
  signOwnershipProof(privateKey) {
    this.setOwnershipProofSignature(
      HashSigner.signData(this.lockedOutpoint, privateKey),
    );

    return this;
  }

  /**
   * @param {string|Buffer} publicKeyHash
   * @return {boolean}
   */
  verifyOwnershipProofSignature(publicKeyHash) {
    return HashSigner.verifyDataSignature(
      this.lockedOutpoint, this.ownershipProofSignature, publicKeyHash,
    );
  }

  /**
   * @param {Buffer} ownershipProofSignature
   * @return {IdentityCreateStateTransition}
   */
  setOwnershipProofSignature(ownershipProofSignature) {
    this.ownershipProofSignature = ownershipProofSignature;

    return this;
  }

  /**
   * @return {Buffer}
   */
  getOwnershipProofSignature() {
    return this.ownershipProofSignature;
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

module.exports = IdentityCreateStateTransition;
