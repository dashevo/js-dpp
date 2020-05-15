const { Transaction } = require('@dashevo/dashcore-lib');
const WrongOutPointError = require('@dashevo/dashcore-lib/lib/errors/WrongOutPointError');

const IdentityLockTransactionNotFoundError = require('../errors/IdentityLockTransactionNotFoundError');
const InvalidIdentityOutPointError = require('../errors/InvalidIdentityOutPointError');
const IdentityLockTransactionIsNotFinalizedError = require('../errors/IdentityLockTransactionIsNotFinalizedError');

/**
 *
 * @param {StateRepository} stateRepository
 * @param {function} parseTransactionOutPointBuffer
 * @param {boolean} [enableLockTxOneBlockConfirmationFallback]
 * @return {fetchLockTransactionOutput}
 */
function fetchLockTransactionOutputFactory(
  stateRepository,
  parseTransactionOutPointBuffer,
  enableLockTxOneBlockConfirmationFallback = false,
) {
  /**
   * Returns lock transaction output for provided lockedOutPoint
   *
   * @typedef fetchLockTransactionOutput
   * @param {string} lockedOutPoint
   * @return {Promise<Object>}
   */
  async function fetchLockTransactionOutput(lockedOutPoint) {
    let transactionHash;
    let outputIndex;

    const lockedOutBuffer = Buffer.from(lockedOutPoint, 'base64');

    try {
      ({ transactionHash, outputIndex } = parseTransactionOutPointBuffer(lockedOutBuffer));
    } catch (e) {
      if (e instanceof WrongOutPointError) {
        throw new InvalidIdentityOutPointError(e.message);
      } else {
        throw e;
      }
    }

    const rawTransaction = await stateRepository.fetchTransaction(transactionHash);

    if (!rawTransaction) {
      throw new IdentityLockTransactionNotFoundError(transactionHash);
    }

    if (enableLockTxOneBlockConfirmationFallback) {
      // check confirmations
      if (!rawTransaction.confirmations) {
        throw new IdentityLockTransactionIsNotFinalizedError(transactionHash);
      }
    } else if (!rawTransaction.chainlock && !rawTransaction.instantlock) {
      // check chainLock and instantLock
      throw new IdentityLockTransactionIsNotFinalizedError(transactionHash);
    }

    const transaction = new Transaction(rawTransaction.hex);

    if (!transaction.outputs[outputIndex]) {
      throw new InvalidIdentityOutPointError(`Output with index ${outputIndex} not found`);
    }

    return transaction.outputs[outputIndex];
  }

  return fetchLockTransactionOutput;
}

module.exports = fetchLockTransactionOutputFactory;
