const { Transaction } = require('@dashevo/dashcore-lib');
const InstantAssetLockProof = require('./instant/InstantAssetLockProof');
const ChainAssetLockProof = require('./chain/ChainAssetLockProof');
const UnknownAssetLockProofError = require('../../errors/UnknownAssetLockProofTypeError');
const AssetLockTransactionIsNotFoundError = require('../../errors/AssetLockTransactionIsNotFoundError');

/**
 * @param {StateRepository} stateRepository
 *
 * @returns {fetchAssetLockTransactionOutput}
 */

function fetchAssetLockTransactionOutputFactory(
  stateRepository,
) {
  /**
   *
   * @typedef fetchAssetLockTransactionOutput
   * @param {InstantAssetLockProof|ChainAssetLockProof} assetLockProof
   * @returns {Promise<Output>}
   */
  async function fetchAssetLockTransactionOutput(assetLockProof) {
    if (assetLockProof.getType() === InstantAssetLockProof.type) {
      return assetLockProof.getOutput();
    }

    if (assetLockProof.getType() === ChainAssetLockProof.type) {
      const outPoint = Transaction.parseOutPointBuffer(assetLockProof.getOutPoint());
      const { outputIndex, transactionHash } = outPoint;
      const rawTransaction = await stateRepository.fetchTransaction(transactionHash);
      if (rawTransaction === null) {
        throw new AssetLockTransactionIsNotFoundError(transactionHash);
      }

      const transaction = new Transaction(rawTransaction.data);
      return transaction.outputs[outputIndex];
    }

    throw new UnknownAssetLockProofError(assetLockProof.getType());
  }

  return fetchAssetLockTransactionOutput;
}

module.exports = fetchAssetLockTransactionOutputFactory;
