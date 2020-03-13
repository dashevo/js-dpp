const bs58 = require('bs58');

const {
  PublicKey,
  PrivateKey,
  Signer: { sign, verifySignature },
} = require('@dashevo/dashcore-lib');

const hash = require('../../../util/hash');
const AbstractIdentityStateTransition = require('../AbstractIdentityStateTransition');
const stateTransitionTypes = require('../../../stateTransition/stateTransitionTypes');
const IdentityPublicKey = require('../../IdentityPublicKey');

const StateTransitionIsNotSignedError = require('../../../stateTransition/errors/StateTransitionIsNotSignedError');

class IdentityCreateTransition extends AbstractIdentityStateTransition {
  /**
   * @param {RawIdentityCreateTransition} [rawIdentityCreateTransition]
   */
  constructor(rawIdentityCreateTransition) {
    super();

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
   * @param {string} lockedOutPoint
   * @return {IdentityCreateTransition}
   */
  setLockedOutPoint(lockedOutPoint) {
    this.lockedOutPoint = lockedOutPoint;
    this.identityId = bs58.encode(
      hash(Buffer.from(lockedOutPoint, 'base64')),
    );

    return this;
  }

  /**
   * @return {string}
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
   * @param {Object} [options]
   * @return {RawIdentityCreateTransition}
   */
  toJSON(options) {
    return {
      ...super.toJSON(options),
      lockedOutPoint: this.getLockedOutPoint(),
      publicKeys: this.getPublicKeys()
        .map((publicKey) => publicKey.toJSON()),
    };
  }

  /**
   * Sign data
   *
   * @param {string|Buffer|Uint8Array|PrivateKey} privateKey string must be hex or base58
   * @return {AbstractStateTransition}
   */
  sign(privateKey) {
    const data = this.serialize({ skipSignature: true });
    const privateKeyModel = new PrivateKey(privateKey);

    this.signature = sign(data, privateKeyModel).toString('base64');

    return this;
  }

  /**
   * Verify signature
   * @param {string|Buffer|Uint8Array|PublicKey} publicKey string must be hex or base58
   * @returns {boolean}
   */
  verifySignature(publicKey) {
    const signature = this.getSignature();
    if (!signature) {
      throw new StateTransitionIsNotSignedError(this);
    }

    const signatureBuffer = Buffer.from(signature, 'base64');
    const data = this.serialize({ skipSignature: true });

    const publicKeyModel = new PublicKey(publicKey);

    let isSignatureVerified;
    try {
      isSignatureVerified = verifySignature(data, signatureBuffer, publicKeyModel);
    } catch (e) {
      isSignatureVerified = false;
    }

    return isSignatureVerified;
  }
}

module.exports = IdentityCreateTransition;
