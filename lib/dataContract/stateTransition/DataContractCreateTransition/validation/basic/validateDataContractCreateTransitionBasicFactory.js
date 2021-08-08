const DataContractCreateTransition = require('../../DataContractCreateTransition');

const InvalidDataContractIdError = require('../../../../../errors/InvalidDataContractIdError');

const generateDataContractId = require('../../../../generateDataContractId');

const convertBuffersToArrays = require('../../../../../util/convertBuffersToArrays');

const dataContractCreateTransitionSchema = require('../../../../../../schema/dataContract/stateTransition/dataContractCreate.json');

/**
 * @param {JsonSchemaValidator} jsonSchemaValidator
 * @param {validateDataContract} validateDataContract
 * @param {validateStateTransitionSignature} validateStateTransitionSignature
 * @return {validateDataContractCreateTransitionStructure}
 */
function validateDataContractCreateTransitionBasicFactory(
  jsonSchemaValidator,
  validateDataContract,
) {
  /**
   * @typedef validateDataContractCreateTransitionStructure
   * @param {RawDataContractCreateTransition} rawStateTransition
   * @return {ValidationResult}
   */
  async function validateDataContractCreateTransitionStructure(rawStateTransition) {
    const result = jsonSchemaValidator.validate(
      dataContractCreateTransitionSchema,
      convertBuffersToArrays(rawStateTransition),
    );

    if (!result.isValid()) {
      return result;
    }

    // Validate Data Contract
    const rawDataContract = rawStateTransition.dataContract;

    result.merge(
      await validateDataContract(rawDataContract),
    );

    if (!result.isValid()) {
      return result;
    }

    // Validate Data Contract ID
    const generatedId = generateDataContractId(
      rawDataContract.ownerId, rawStateTransition.entropy,
    );

    if (!generatedId.equals(rawDataContract.$id)) {
      result.addError(
        new InvalidDataContractIdError(rawDataContract),
      );
    }

    return result;
  }

  return validateDataContractCreateTransitionStructure;
}

module.exports = validateDataContractCreateTransitionBasicFactory;
