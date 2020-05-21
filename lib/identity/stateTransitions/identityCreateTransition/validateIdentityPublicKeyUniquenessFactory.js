const ValidationResult = require('../../../validation/ValidationResult');

const IdentityPublicKeyAlreadyExistsError = require(
  '../../../errors/IdentityPublicKeyAlreadyExistsError',
);

/**
 * Validate that no identity bound to this key (factory)
 *
 * @param {StateRepository} stateRepository
 *
 * @returns {validateIdentityPublicKeyUniqueness}
 */
function validateIdentityPublicKeyUniquenessFactory(stateRepository) {
  /**
   * Validate that no identity bound to this key
   *
   * @typedef validateIdentityPublicKeyUniqueness
   *
   * @param {IdentityPublicKey} identityPublicKey
   *
   * @returns {Promise<ValidationResult>}
   */
  async function validateIdentityPublicKeyUniqueness(identityPublicKey) {
    const validationResult = new ValidationResult();

    const identity = await stateRepository.fetchPublicKeyIdentityId(identityPublicKey.hash());

    if (identity) {
      validationResult.addError(
        new IdentityPublicKeyAlreadyExistsError(identityPublicKey.hash()),
      );
    }

    return validationResult;
  }

  return validateIdentityPublicKeyUniqueness;
}

module.exports = validateIdentityPublicKeyUniquenessFactory;
