const { Transaction } = require('@dashevo/dashcore-lib');
const chainAssetLockProofSchema = require('../../../../../schema/identity/stateTransition/assetLockProof/chainAssetLockProof.json');

const convertBuffersToArrays = require('../../../../util/convertBuffersToArrays');
const InvalidIdentityAssetLockProofCoreHeightError = require('../../../../errors/InvalidIdentityAssetLockProofCoreHeightError');
const IdentityAssetLockProofOutPointIsAlreadyUsedError = require('../../../../errors/IdentityAssetLockProofOutPointIsAlreadyUsedError');
const IdentityAssetLockTransactionIsNotFoundError = require('../../../../errors/IdentityAssetLockTransactionIsNotFoundError');
const validateAssetLockTransaction = require('../validateAssetLockTransaction');

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

    if (currentCoreChainLockedHeight > proofCoreChainLockedHeight) {
      result.addError(
        new InvalidIdentityAssetLockProofCoreHeightError(
          proofCoreChainLockedHeight,
          currentCoreChainLockedHeight,
        ),
      );

      return result;
    }

    if (!await stateRepository.isAssetLockTransactionOutPointAlreadyUsed(outPointBuffer)) {
      result.addError(new IdentityAssetLockProofOutPointIsAlreadyUsedError(outPointBuffer));

      return result;
    }

    const outPoint = Transaction.parseOutPointBuffer(outPointBuffer);
    const { outputIndex } = outPoint;
    const rawTransaction = await stateRepository.fetchTransaction(outPoint.transactionHash);

    if (rawTransaction === null) {
      result.addError(new IdentityAssetLockTransactionIsNotFoundError(outPointBuffer));

      return result;
    }

    const isAssetLockTransactionValid = await validateAssetLockTransaction(
      rawTransaction,
      outputIndex,
    );

    result.merge(isAssetLockTransactionValid);

    if (!result.isValid()) {
      return result;
    }

    const { publicKeyHash } = isAssetLockTransactionValid.getData();

    result.setData(publicKeyHash);

    return result;
  }

  return validateChainAssetLockProofStructure;
}

module.exports = validateChainAssetLockProofStructureFactory;
