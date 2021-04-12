const { Transaction } = require('@dashevo/dashcore-lib');
const chainAssetLockProofSchema = require('../../../../../../schema/identity/stateTransition/assetLock/proof/chainAssetLockProof.json');

const convertBuffersToArrays = require('../../../../../util/convertBuffersToArrays');
const InvalidIdentityAssetLockProofHeightError = require('../../../../../errors/InvalidIdentityAssetLockProofHeightError');
const InvalidIdentityAssetLockProofOutPointError = require('../../../../../errors/InvalidIdentityAssetLockProofOutPointError');
const InvalidIdentityAssetLockTransactionError = require('../../../../../errors/InvalidIdentityAssetLockTransactionError');
const IdentityAssetLockTransactionOutputNotFoundError = require('../../../../../errors/IdentityAssetLockTransactionOutputNotFoundError');
const InvalidIdentityAssetLockTransactionOutputError = require('../../../../../errors/InvalidIdentityAssetLockTransactionOutputError');

/**
 * @param {JsonSchemaValidator} jsonSchemaValidator
 * @param {StateRepository} stateRepository
 * @returns {validateChainAssetLockProofStructure}
 */
function validateChainAssetLockProofStructureFactory(
  jsonSchemaValidator,
  stateRepository,
) {
  /**
   * @typedef {validateChainAssetLockProofStructure}
   * @param {RawChainAssetLockProof} rawAssetLockProof
   */
  async function validateChainAssetLockProofStructure(
    rawAssetLockProof,
  ) {
    const result = jsonSchemaValidator.validate(
      chainAssetLockProofSchema,
      convertBuffersToArrays(rawAssetLockProof),
    );

    if (!result.isValid()) {
      return result;
    }

    const { height, outPoint: outPointBuffer } = rawAssetLockProof;

    if (!await stateRepository.verifyChainLockHeight(height)) {
      result.addError(new InvalidIdentityAssetLockProofHeightError(height));

      return result;
    }

    if (!await stateRepository.checkAssetLockTransactionOutPointAlreadyUsed(outPointBuffer)) {
      result.addError(new InvalidIdentityAssetLockProofOutPointError(outPointBuffer));

      return result;
    }

    const outPoint = Transaction.parseOutPointBuffer(outPointBuffer);
    const { outputIndex } = outPoint;
    let rawTransaction;

    try {
      rawTransaction = await stateRepository.fetchTransaction(outPoint.transactionHash);
    } catch (e) {
      result.addError();
    }

    if (!result.isValid()) {
      return result;
    }

    /**
     * @type {Transaction}
     */
    let transaction;
    try {
      transaction = new Transaction(rawTransaction);
    } catch (e) {
      const error = new InvalidIdentityAssetLockTransactionError(e.message);

      result.addError(error);

      return result;
    }

    if (!transaction.outputs[outputIndex]) {
      result.addError(
        new IdentityAssetLockTransactionOutputNotFoundError(outputIndex),
      );

      return result;
    }

    const output = transaction.outputs[outputIndex];

    if (!output.script.isDataOut()) {
      result.addError(
        new InvalidIdentityAssetLockTransactionOutputError('Output is not a valid standard OP_RETURN output', output),
      );

      return result;
    }

    const publicKeyHash = transaction.outputs[outputIndex].script.getData();

    if (publicKeyHash.length !== 20) {
      result.addError(
        new InvalidIdentityAssetLockTransactionOutputError('Output has invalid public key hash', output),
      );

      return result;
    }

    result.setData(publicKeyHash);

    return result;
  }

  return validateChainAssetLockProofStructure;
}

module.exports = validateChainAssetLockProofStructureFactory;
