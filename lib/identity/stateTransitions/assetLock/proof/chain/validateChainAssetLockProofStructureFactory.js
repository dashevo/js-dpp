const chainAssetLockProofSchema = require('../../../../../../schema/identity/stateTransition/assetLock/proof/chainAssetLockProof.json');

const convertBuffersToArrays = require('../../../../../util/convertBuffersToArrays');
const InvalidIdentityAssetLockProofHeightError = require('../../../../../errors/InvalidIdentityAssetLockProofHeightError');
const InvalidIdentityAssetLockProofOutPointError = require('../../../../../errors/InvalidIdentityAssetLockProofOutPointError');

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
    // transaction,
  ) {
    const result = jsonSchemaValidator.validate(
      chainAssetLockProofSchema,
      convertBuffersToArrays(rawAssetLockProof),
    );

    if (!result.isValid()) {
      return result;
    }

    const { height, outPoint } = rawAssetLockProof;

    if (!await stateRepository.verifyChainLockHeight(height)) {
      result.addError(new InvalidIdentityAssetLockProofHeightError(height));

      return result;
    }

    if (!await stateRepository.verifyChainLockOutPointIsNotUsed(outPoint)) {
      result.addError(new InvalidIdentityAssetLockProofOutPointError(outPoint));
    }

    return result;
  }

  return validateChainAssetLockProofStructure;
}

module.exports = validateChainAssetLockProofStructureFactory;
