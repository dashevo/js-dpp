const { Transaction, Signer: { verifyHashSignature } } = require('@dashevo/dashcore-lib');

const ValidationResult = require('../../../validation/ValidationResult');

const IdentityAlreadyExistsError = require('../../../errors/IdentityAlreadyExistsError');
const InvalidStateTransitionSignatureError = require('../../../errors/InvalidStateTransitionSignatureError');
const IdentityLockTransactionNotFound = require('../../../errors/IdentityLockTransactionNotFound');

/**
 * @param {DataProvider} dataProvider
 * @param {ValidateLockTransaction} validateLockTransaction
 * @return {validateIdentityCreateSTData}
 */
function validateIdentityCreateSTDataFactory(dataProvider, validateLockTransaction) {
  /**
   *
   * Do we need to check that key ids are incremental?
   *
   * For later versions:
   * 1. We need to check that outpoint exists (not now)
   * 2. Verify ownership proof signature, as it requires special transaction to be implemented
   */

  /**
   * @typedef validateIdentityCreateSTData
   * @param {IdentityCreateTransition} identityCreateTransition
   * @return {ValidationResult}
   */
  async function validateIdentityCreateSTData(identityCreateTransition) {
    const result = new ValidationResult();

    // Check if identity with such id already exists
    const identityId = identityCreateTransition.getIdentityId();
    const identity = await dataProvider.fetchIdentity(identityId);

    if (identity) {
      result.addError(new IdentityAlreadyExistsError(identityCreateTransition));
    }

    if (!result.isValid()) {
      return result;
    }

    // fetch lock transaction, extract pubkey from it and verify signature

    const lockedOutBuffer = Buffer.from(identityCreateTransition.getLockedOutPoint(), 'base64');
    const { transactionHash, outputIndex } = Transaction.parseOutPointBuffer(lockedOutBuffer);
    const rawTransaction = await dataProvider.fetchTransaction(transactionHash);

    if (!rawTransaction) {
      result.addError(new IdentityLockTransactionNotFound(transactionHash));
    }

    if (!result.isValid()) {
      return result;
    }

    const transaction = new Transaction(rawTransaction);

    result.merge(
      validateLockTransaction(transaction, outputIndex),
    );

    if (!result.isValid()) {
      return result;
    }

    const publicKeyHash = transaction.outputs[outputIndex].script.getData();

    const signatureIsVerified = verifyHashSignature(
      Buffer.from(identityCreateTransition.hash({ skipSignature: true }), 'hex'),
      Buffer.from(identityCreateTransition.getSignature(), 'base64'),
      publicKeyHash,
    );

    if (!signatureIsVerified) {
      result.addError(new InvalidStateTransitionSignatureError(identityCreateTransition));
    }

    return result;
  }

  return validateIdentityCreateSTData;
}

module.exports = validateIdentityCreateSTDataFactory;
