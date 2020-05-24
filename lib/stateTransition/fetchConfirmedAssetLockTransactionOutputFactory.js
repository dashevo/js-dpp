const { Transaction } = require('@dashevo/dashcore-lib');
const WrongOutPointError = require('@dashevo/dashcore-lib/lib/errors/WrongOutPointError');

const IdentityAssetLockTransactionNotFoundError = require('../errors/IdentityAssetLockTransactionNotFoundError');
const InvalidIdentityOutPointError = require('../errors/InvalidIdentityOutPointError');
const IdentityAssetLockTransactionIsNotConfirmedError = require('../errors/IdentityAssetLockTransactionIsNotConfirmedError');

/**
 *
 * @param {StateRepository} stateRepository
 * @param {function} parseTransactionOutPointBuffer
 * @param {boolean} [enableAssetLockTxOneBlockConfirmationFallback]
 * @return {fetchConfirmedAssetLockTransactionOutput}
 */
function fetchConfirmedAssetLockTransactionOutputFactory(
  stateRepository,
  parseTransactionOutPointBuffer,
  enableAssetLockTxOneBlockConfirmationFallback = false,
) {
  /**
   * Returns lock transaction output for provided lockedOutPoint
   *
   * @typedef fetchConfirmedAssetLockTransactionOutput
   * @param {string} lockedOutPoint
   * @return {Promise<Object>}
   */
  async function fetchConfirmedAssetLockTransactionOutput(lockedOutPoint) {
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
      throw new IdentityAssetLockTransactionNotFoundError(transactionHash);
    }

    let txIsFinalized = rawTransaction.chainlock || rawTransaction.instantlock;
    if (!txIsFinalized && enableAssetLockTxOneBlockConfirmationFallback) {
      txIsFinalized = rawTransaction.confirmations > 0;
    }

    if (!txIsFinalized) {
      throw new IdentityAssetLockTransactionIsNotConfirmedError(transactionHash);
    }

    const transaction = new Transaction(rawTransaction.hex);

    if (!transaction.outputs[outputIndex]) {
      throw new InvalidIdentityOutPointError(`Output with index ${outputIndex} not found`);
    }

    return transaction.outputs[outputIndex];
  }

  return fetchConfirmedAssetLockTransactionOutput;
}

module.exports = fetchConfirmedAssetLockTransactionOutputFactory;
