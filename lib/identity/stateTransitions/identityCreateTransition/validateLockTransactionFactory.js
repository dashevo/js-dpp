const { Signer: { verifyHashSignature } } = require('@dashevo/dashcore-lib');
const { Transaction } = require('@dashevo/dashcore-lib');
const WrongOutPointError = require('@dashevo/dashcore-lib/lib/errors/WrongOutPointError');

const ValidationResult = require('../../../validation/ValidationResult');
const ConsensusError = require('../../../errors/ConsensusError');
const InvalidIdentityLockTransactionOutputError = require('../../../errors/InvalidIdentityLockTransactionOutputError');
const InvalidStateTransitionSignatureError = require('../../../errors/InvalidStateTransitionSignatureError');
const IdentityLockTransactionNotFoundError = require('../../../errors/IdentityLockTransactionNotFoundError');
const InvalidIdentityOutPointError = require('../../../errors/InvalidIdentityOutPointError');
const IdentityLockTransactionIsNotFinalizedError = require('../../../errors/IdentityLockTransactionIsNotFinalizedError');
/**
 *
 * @param {StateRepository} stateRepository
 * @param {function} parseTransactionOutPointBuffer
 * @param {boolean} useLockTxFallback
 * @return {validateLockTransaction}
 */
function validateLockTransactionFactory(
  stateRepository,
  parseTransactionOutPointBuffer,
  useLockTxFallback = false,
) {
  /**
   * Validates identityCreateTransition signature against lock transaction
   *
   * @typedef validateLockTransaction
   * @param {IdentityCreateTransition} identityCreateTransition
   * @returns {Promise<ValidationResult>}
   */
  async function validateLockTransaction(identityCreateTransition) {
    // fetch lock transaction output, extract pubkey from it and verify signature

    const result = new ValidationResult();

    let transactionHash;
    let outputIndex;

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

    let rawTransaction;

    try {
      rawTransaction = await stateRepository.fetchTransaction(transactionHash, true);
    } catch (e) {
      if (e instanceof ConsensusError) {
        result.addError(e);
      } else {
        throw e;
      }
    }

    if (!rawTransaction) {
      result.addError(new IdentityLockTransactionNotFoundError(transactionHash));
    }

    if (!result.isValid()) {
      return result;
    }

    const transaction = new Transaction(rawTransaction.hex);

    if (!transaction.outputs[outputIndex]) {
      result.addError(new InvalidIdentityOutPointError(`Output with index ${outputIndex} not found`));

      return result;
    }

    if (useLockTxFallback) {
      // check confirmations
      if (!rawTransaction.confirmations) {
        result.addError(new IdentityLockTransactionIsNotFinalizedError(transactionHash));
      }
    } else if (!rawTransaction.chainlock && !rawTransaction.instantlock) {
      // check chainLock and instantLock
      result.addError(new IdentityLockTransactionIsNotFinalizedError(transactionHash));
    }

    if (!result.isValid()) {
      return result;
    }

    const output = transaction.outputs[outputIndex];

    const { script } = output;

    if (!script.isDataOut()) {
      result.addError(new InvalidIdentityLockTransactionOutputError('Output is not a valid standard OP_RETURN output', output));
    }

    const publicKeyHash = script.getData();

    if (publicKeyHash.length !== 20) {
      result.addError(new InvalidIdentityLockTransactionOutputError('Output has invalid public key hash', output));
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

    return result;
  }

  return validateLockTransaction;
}

module.exports = validateLockTransactionFactory;
