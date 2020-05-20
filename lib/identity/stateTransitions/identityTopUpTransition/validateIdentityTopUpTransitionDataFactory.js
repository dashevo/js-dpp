const ValidationResult = require('../../../validation/ValidationResult');

const IdentityNotFoundError = require('../../../errors/IdentityNotFoundError');

/**
 * @param {StateRepository} stateRepository
 * @param {validateLockTransaction} validateLockTransaction
 * @return {validateIdentityTopUpSTData}
 */
function validateIdentityTopUpTransitionDataFactory(stateRepository, validateLockTransaction) {
  /**
   *
   * For later versions:
   * 1. We need to check that outpoint exists (not now)
   * 2. Verify ownership proof signature, as it requires special transaction to be implemented
   */

  /**
   * @typedef validateIdentityTopUpSTData
   * @param {IdentityTopUpTransition} identityTopUpTransition
   * @return {ValidationResult}
   */
  async function validateIdentityTopUpSTData(identityTopUpTransition) {
    const result = new ValidationResult();

    // Check if identity with such id already exists
    const identityId = identityTopUpTransition.getIdentityId();
    const identity = await stateRepository.fetchIdentity(identityId);

    if (!identity) {
      result.addError(new IdentityNotFoundError(identityId));
    }

    if (!result.isValid()) {
      return result;
    }

    result.merge(
      await validateLockTransaction(identityTopUpTransition),
    );

    return result;
  }

  return validateIdentityTopUpSTData;
}

module.exports = validateIdentityTopUpTransitionDataFactory;
