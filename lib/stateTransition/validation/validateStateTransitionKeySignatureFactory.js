const InvalidStateTransitionSignatureError = require('../../errors/InvalidStateTransitionSignatureError');

const ValidationResult = require('../../validation/ValidationResult');

/**
 * @param {createStateTransition} createStateTransition
 * @param {Function} verifyHashSignature
 * @param {fetchAssetLockPublicKeyHash} fetchAssetLockPublicKeyHash
 * @returns {validateSignatureAgainstAssetLockPublicKey}
 */
function validateStateTransitionKeySignatureFactory(
  createStateTransition,
  verifyHashSignature,
  fetchAssetLockPublicKeyHash,
) {
  /**
   * @typedef {validateSignatureAgainstAssetLockPublicKey}
   * @param {IdentityCreateTransition|IdentityTopUpTransition} stateTransition
   * @returns {Promise<ValidationResult>}
   */
  async function validateSignatureAgainstAssetLockPublicKey(stateTransition) {
    const result = new ValidationResult();

    const stateTransitionHash = stateTransition.hash({ skipSignature: true });

    let signatureIsVerified;

    try {
      signatureIsVerified = verifyHashSignature(
        stateTransitionHash,
        stateTransition.getSignature(),
        fetchAssetLockPublicKeyHash(stateTransition.getAssetLockProof()),
      );
    } catch (e) {
      signatureIsVerified = false;
    }

    if (!signatureIsVerified) {
      result.addError(new InvalidStateTransitionSignatureError(stateTransition));
    }

    return result;
  }

  return validateSignatureAgainstAssetLockPublicKey;
}

module.exports = validateStateTransitionKeySignatureFactory;
