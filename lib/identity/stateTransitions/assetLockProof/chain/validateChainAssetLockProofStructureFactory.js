const { Transaction } = require('@dashevo/dashcore-lib');
const chainAssetLockProofSchema = require('../../../../../schema/identity/stateTransition/assetLockProof/chainAssetLockProof.json');

const convertBuffersToArrays = require('../../../../util/convertBuffersToArrays');
const InvalidAssetLockProofCoreChainHeightError = require('../../../../errors/InvalidAssetLockProofCoreChainHeightError');
const IdentityAssetLockTransactionIsNotFoundError = require('../../../../errors/IdentityAssetLockTransactionIsNotFoundError');

/**
 * @param {JsonSchemaValidator} jsonSchemaValidator
 * @param {StateRepository} stateRepository
 * @param {validateAssetLockTransaction} validateAssetLockTransaction
 * @returns {validateChainAssetLockProofStructure}
 */
function validateChainAssetLockProofStructureFactory(
  jsonSchemaValidator,
  stateRepository,
  validateAssetLockTransaction,
) {
  /**
   * @typedef {validateChainAssetLockProofStructure}
   * @param {RawChainAssetLockProof} rawAssetLockProof
   * @returns {ValidationResult}
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

    const {
      coreChainLockedHeight: proofCoreChainLockedHeight,
      outPoint: outPointBuffer,
    } = rawAssetLockProof;

    const outPoint = Transaction.parseOutPointBuffer(outPointBuffer);
    const { outputIndex, transactionHash } = outPoint;

    const rawTransaction = await stateRepository.fetchTransaction(transactionHash);

    if (rawTransaction === null) {
      result.addError(new IdentityAssetLockTransactionIsNotFoundError(outPointBuffer));

      return result;
    }

    if (proofCoreChainLockedHeight < rawTransaction.height) {
      result.addError(
        new InvalidAssetLockProofCoreChainHeightError(
          proofCoreChainLockedHeight,
          rawTransaction.height,
        ),
      );

      return result;
    }

    const validateAssetLockTransactionResult = await validateAssetLockTransaction(
      Buffer.from(rawTransaction.hex, 'hex'),
      outputIndex,
    );

    result.merge(validateAssetLockTransactionResult);

    if (!result.isValid()) {
      return result;
    }

    const { publicKeyHash } = validateAssetLockTransactionResult.getData();

    result.setData(publicKeyHash);

    return result;
  }

  return validateChainAssetLockProofStructure;
}

module.exports = validateChainAssetLockProofStructureFactory;
