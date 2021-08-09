const { Transaction } = require('@dashevo/dashcore-lib');

const InstantAssetLockProof = require('./instant/InstantAssetLockProof');
const ChainAssetLockProof = require('./chain/ChainAssetLockProof');

/**
 * @param {StateRepository} stateRepository
 * @return {fetchAssetLockPublicKeyHash}
 */
function fetchAssetLockPublicKeyHashFactory(stateRepository) {
  /**
   * @typedef {fetchAssetLockPublicKeyHash}
   * @param {InstantAssetLockProof|ChainAssetLockProof} assetLockProof
   * @return {Promise<Buffer>}
   */
  async function fetchAssetLockPublicKeyHash(assetLockProof) {
    let transaction;
    let outputIndex;

    if (assetLockProof instanceof InstantAssetLockProof) {
      transaction = assetLockProof.getTransaction();
      outputIndex = assetLockProof.getOutputIndex();
    } else if (assetLockProof instanceof ChainAssetLockProof) {
      const outPoint = Transaction.parseOutPointBuffer(assetLockProof.getOutPoint());

      outputIndex = outPoint.outputIndex;

      const rawTransaction = await stateRepository.fetchTransaction(outPoint.transactionHash);

      if (!rawTransaction) {
        throw new Error();
      }

      transaction = new Transaction(rawTransaction);
    }

    const output = transaction.outputs[outputIndex];

    if (!output) {
      throw new Error();
    }

    return output.script.getData();
  }

  return fetchAssetLockPublicKeyHash;
}

module.exports = fetchAssetLockPublicKeyHashFactory;
