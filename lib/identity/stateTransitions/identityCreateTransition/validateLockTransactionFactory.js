const { Transaction, Signer: { verifyHashSignature } } = require('@dashevo/dashcore-lib');
const WrongOutPointError = require('@dashevo/dashcore-lib/lib/errors/WrongOutPointError');
const ValidationResult = require('../../../validation/ValidationResult');

const InvalidIdentityLockTransactionError = require('../../../errors/InvalidIdentityLockTransactionError');
const InvalidStateTransitionSignatureError = require('../../../errors/InvalidStateTransitionSignatureError');
const IdentityLockTransactionNotFoundError = require('../../../errors/IdentityLockTransactionNotFoundError');
const InvalidIdentityOutPointError = require('../../../errors/InvalidIdentityOutPointError');
/**
 *
 * @param {DataProvider} dataProvider
 * @param {function} parseTransactionOutPointBuffer
 * @return {validateLockTransaction}
 */
function validateLockTransactionFactory(dataProvider, parseTransactionOutPointBuffer) {
  /**
   * @typedef validateLockTransaction
   * @param {IdentityCreateTransition} identityCreateTransition
   * @returns {Promise<ValidationResult>}
   */
  async function validateLockTransaction(identityCreateTransition) {
    const result = new ValidationResult();
    let transactionHash;
    let outputIndex;

    // fetch lock transaction, extract pubkey from it and verify signature

    const lockedOutBuffer = Buffer.from(identityCreateTransition.getLockedOutPoint(), 'base64');

    try {
      ({ transactionHash, outputIndex } = parseTransactionOutPointBuffer(lockedOutBuffer));
    } catch (e) {
      if (e instanceof WrongOutPointError) {
        result.addError(new InvalidIdentityOutPointError(e.message));
      } else {
        throw e;
      }
    }

    if (!result.isValid()) {
      return result;
    }

    const rawTransaction = await dataProvider.fetchTransaction(transactionHash);

    if (!rawTransaction) {
      result.addError(new IdentityLockTransactionNotFoundError(transactionHash));
    }

    if (!result.isValid()) {
      return result;
    }

    const transaction = new Transaction(rawTransaction);

    if (!transaction.outputs[outputIndex]) {
      result.addError(new InvalidIdentityOutPointError(`Output with index ${outputIndex} not found`));
    }

    if (!result.isValid()) {
      return result;
    }

    const { script } = transaction.outputs[outputIndex];

    if (!script.isDataOut()) {
      result.addError(new InvalidIdentityLockTransactionError('Output is not a valid standard OP_RETURN output', transaction));
    }

    const publicKeyHash = script.getData();

    if (publicKeyHash.length !== 20) {
      result.addError(new InvalidIdentityLockTransactionError('Output has invalid public key hash', transaction));
    }

    if (!result.isValid()) {
      return result;
    }

    let signatureIsVerified;

    try {
      signatureIsVerified = verifyHashSignature(
        Buffer.from(identityCreateTransition.hash({ skipSignature: true }), 'hex'),
        Buffer.from(identityCreateTransition.getSignature(), 'base64'),
        publicKeyHash,
      );
    } catch (e) {
      signatureIsVerified = false;
    }


    if (!signatureIsVerified) {
      result.addError(new InvalidStateTransitionSignatureError(identityCreateTransition));
    }

    if (result.isValid()) {
      result.setData(transaction);
    }

    return result;
  }

  return validateLockTransaction;
}

module.exports = validateLockTransactionFactory;
