const { Transaction } = require('@dashevo/dashcore-lib');
const chainAssetLockProofSchema = require('../../../../../schema/identity/stateTransition/assetLockProof/chainAssetLockProof.json');

const convertBuffersToArrays = require('../../../../util/convertBuffersToArrays');
const InvalidIdentityAssetLockProofCoreHeightError = require('../../../../errors/InvalidIdentityAssetLockProofCoreHeightError');
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

    const latestPlatformBlockHeader = await stateRepository.fetchLatestPlatformBlockHeader();

    const { coreChainLockedHeight: currentCoreChainLockedHeight } = latestPlatformBlockHeader;

    if (proofCoreChainLockedHeight > currentCoreChainLockedHeight) {
      result.addError(
        new InvalidIdentityAssetLockProofCoreHeightError(
          proofCoreChainLockedHeight,
          currentCoreChainLockedHeight,
        ),
      );

      return result;
    }

    const outPoint = Transaction.parseOutPointBuffer(outPointBuffer);
    const { outputIndex, transactionHash } = outPoint;

    const rawTransaction = await stateRepository.fetchTransaction(transactionHash);

    if (rawTransaction === null) {
      result.addError(new IdentityAssetLockTransactionIsNotFoundError(outPointBuffer));

      return result;
    }

    const validateAssetLockTransactionResult = await validateAssetLockTransaction(
      rawTransaction,
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
