const { Transaction } = require('@dashevo/dashcore-lib');

const assetLockSchema = require('../../../../schema/identity/stateTransition/assetLock/assetLock.json');

const convertBuffersToArrays = require('../../../util/convertBuffersToArrays');
const InvalidIdentityAssetLockTransactionOutputError = require('../../../errors/InvalidIdentityAssetLockTransactionOutputError');
const AssetLock = require('./AssetLock');
const InvalidIdentityAssetLockProofError = require('../../../errors/InvalidIdentityAssetLockProofError');
const InvalidIdentityAssetLockTransactionError = require('../../../errors/InvalidIdentityAssetLockTransactionError');
const IdentityAssetLockTransactionOutputNotFoundError = require('../../../errors/IdentityAssetLockTransactionOutputNotFoundError');

/**
 * @param {JsonSchemaValidator} jsonSchemaValidator
 * @param {Object.<number, Function>} proofValidationFunctionsByType
 * @param {StateRepository} stateRepository
 * @returns {validateAssetLockStructure}
 */
function validateAssetLockStructureFactory(
  jsonSchemaValidator,
  proofValidationFunctionsByType,
  stateRepository,
) {
  /**
   * @typedef {validateAssetLockStructure}
   * @param {RawAssetLock} rawAssetLock
   * @returns {Promise<ValidationResult>}
   */
  async function validateAssetLockStructure(rawAssetLock) {
    const result = jsonSchemaValidator.validate(
      assetLockSchema,
      convertBuffersToArrays(rawAssetLock),
    );

    if (!result.isValid()) {
      return result;
    }

    const proofValidationFunction = proofValidationFunctionsByType[rawAssetLock.proof.type];

    result.merge(
      await proofValidationFunction(rawAssetLock.proof),
    );

    if (!result.isValid()) {
      return result;
    }

    let rawTransaction;
    let outputIndex;

    switch (rawAssetLock.proof.type) {
      case AssetLock.PROOF_TYPE_CHAIN: {
        const outPoint = Transaction.parseOutPointBuffer(rawAssetLock.proof.outPoint);
        rawTransaction = await stateRepository.fetchTransaction(outPoint.transactionHash);
        outputIndex = outPoint.outputIndex;
      }
        break;
      case AssetLock.PROOF_TYPE_INSTANT:
        rawTransaction = rawAssetLock.proof.transaction;
        outputIndex = rawAssetLock.proof.outputIndex;
        break;
      default:
        result.addError(
          new InvalidIdentityAssetLockProofError('Unknown asset lock proof type'),
        );
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

  return validateAssetLockStructure;
}

module.exports = validateAssetLockStructureFactory;
