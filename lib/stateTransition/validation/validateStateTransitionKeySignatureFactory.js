const InvalidStateTransitionSignatureError = require('../../errors/consensus/signature/InvalidStateTransitionSignatureError');

const ValidationResult = require('../../validation/ValidationResult');

const { doubleSHA256: hash } = require('../../util/hash');

/**
 * @param {Function} verifyHashSignature
 * @param {fetchAssetLockPublicKeyHash} fetchAssetLockPublicKeyHash
 * @returns {validateStateTransitionKeySignature}
 */
function validateStateTransitionKeySignatureFactory(
  verifyHashSignature,
  fetchAssetLockPublicKeyHash,
) {
  /**
   * @typedef {validateStateTransitionKeySignature}
   * @param {IdentityCreateTransition|IdentityTopUpTransition} stateTransition
   * @returns {Promise<ValidationResult>}
   */
  async function validateStateTransitionKeySignature(stateTransition) {
    const result = new ValidationResult();

    const stateTransitionHash = hash(stateTransition.toBuffer({ skipSignature: true }));
    const publicKeyHash = await fetchAssetLockPublicKeyHash(stateTransition.getAssetLockProof());

    let signatureIsVerified;

    try {
      signatureIsVerified = verifyHashSignature(
        stateTransitionHash,
        stateTransition.getSignature(),
        publicKeyHash,
      );
    } catch (e) {
      signatureIsVerified = false;
    }

    if (!signatureIsVerified) {
      result.addError(new InvalidStateTransitionSignatureError());
    }

    return result;
  }

  return validateStateTransitionKeySignature;
}

module.exports = validateStateTransitionKeySignatureFactory;
