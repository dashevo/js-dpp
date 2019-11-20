const { HashSigner } = require('@dashevo/dashcore-lib');
const hash = require('../../util/hash');
const AbstractStateTransition = require('../../stateTransition/AbstractStateTransition');
const stateTransitionTypes = require('../../stateTransition/stateTransitionTypes');
const Identity = require('../Identity');
const PublicKey = require('../PublicKey');

class IdentityCreateStateTransition extends AbstractStateTransition {
  /**
   * @param {RawIdentityCreateStateTransition} [rawIdentityCreateStateTransition]
   */
  constructor(rawIdentityCreateStateTransition) {
    super();

    this.publicKeys = [];

    if (rawIdentityCreateStateTransition) {
      if (rawIdentityCreateStateTransition.publicKeys) {
        this.setPublicKeys(
          rawIdentityCreateStateTransition.publicKeys
            .map(rawPublicKey => new PublicKey(rawPublicKey)),
        );
      }

      this
        .setIdentityType(rawIdentityCreateStateTransition.identityType)
        .setLockedOutPoint(rawIdentityCreateStateTransition.lockedOutPoint)
        .setOwnershipProofSignature(rawIdentityCreateStateTransition.ownershipProofSignature);
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
   * @return {PublicKey[]}
   */
  getPublicKeys() {
    return this.publicKeys;
  }

  /**
   * Replaces existing set of public keys with a new one
   * @param {PublicKey[]} publicKeys
   * @return {IdentityCreateStateTransition}
   */
  setPublicKeys(publicKeys) {
    this.publicKeys = publicKeys;

    return this;
  }

  /**
   * Adds public keys to the existing public keys array
   * @param {PublicKey[]} publicKeys
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
      identityType: this.getIdentityType(),
      lockedOutPoint: this.getLockedOutPoint(),
      publicKeys: this.getPublicKeys()
        .map(rawPublicKey => rawPublicKey.toJSON()),
      ownershipProofSignature: this.getOwnershipProofSignature(),
    };
  }
}

IdentityCreateStateTransition.IdentityTypes = Identity.TYPES;

IdentityCreateStateTransition.DEFAULTS = {
  CURRENT_VERSION: 0,
};

module.exports = IdentityCreateStateTransition;
