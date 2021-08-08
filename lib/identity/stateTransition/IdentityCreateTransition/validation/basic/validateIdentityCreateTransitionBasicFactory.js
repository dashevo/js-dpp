const identityCreateTransitionSchema = require('../../../../../../schema/identity/stateTransition/identityCreate.json');

const convertBuffersToArrays = require('../../../../../util/convertBuffersToArrays');

/**
 * @param {JsonSchemaValidator} jsonSchemaValidator
 * @param {validatePublicKeys} validatePublicKeys
 * @param {validateSignatureAgainstAssetLockPublicKey} validateSignatureAgainstAssetLockPublicKey
 * @param {Object.<number, Function>} proofValidationFunctionsByType
 * @return {validateIdentityCreateTransitionStructure}
 */
function validateIdentityCreateTransitionBasicFactory(
  jsonSchemaValidator,
  validatePublicKeys,
  validateSignatureAgainstAssetLockPublicKey,
  proofValidationFunctionsByType,
) {
  /**
   * @typedef validateIdentityCreateTransitionStructure
   * @param {RawIdentityCreateTransition} rawStateTransition
   * @return {Promise<ValidationResult>}
   */
  async function validateIdentityCreateTransitionStructure(rawStateTransition) {
    // Validate state transition against JSON Schema
    const result = jsonSchemaValidator.validate(
      identityCreateTransitionSchema,
      convertBuffersToArrays(rawStateTransition),
    );

    if (!result.isValid()) {
      return result;
    }

    result.merge(
      validatePublicKeys(rawStateTransition.publicKeys),
    );

    if (!result.isValid()) {
      return result;
    }

    const proofValidationFunction = proofValidationFunctionsByType[
      rawStateTransition.assetLockProof.type
    ];

    const assetLockProofValidationResult = await proofValidationFunction(
      rawStateTransition.assetLockProof,
    );

    result.merge(
      assetLockProofValidationResult,
    );

    return result;
  }

  return validateIdentityCreateTransitionStructure;
}

module.exports = validateIdentityCreateTransitionBasicFactory;
