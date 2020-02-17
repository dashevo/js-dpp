const ValidationResult = require('../../../validation/ValidationResult');
const JsonSchemaError = require('../../../errors/JsonSchemaError');
const DataContractMaxDepthExceedError = require('../../../errors/DataContractMaxDepthExceedError');

/**
 * Check that JSON Schema max depth is less than max value
 * @private
 * @param {Object} json
 * @returns {number}
 */
function checkMaxDepth(json) {
  let depth = 1;

  Object.keys(json).forEach((key) => {
    if (typeof json[key] === 'object') {
      const tmpDepth = checkMaxDepth(json[key]) + 1;
      depth = Math.max(depth, tmpDepth);
    }
  });

  if (depth > DataContractMaxDepthExceedError.MAX_DEPTH) {
    throw new DataContractMaxDepthExceedError();
  }

  return depth;
}

/**
 *
 * @param {$RefParser} refParser
 * @returns {validateDataContractMaxDepth}
 */
function validateDataContractMaxDepthFactory(refParser) {
  /**
   * Dereference JSON Schema $ref pointers and check max depth
   * @typedef validateDataContractMaxDepth
   * @param {RawDataContract} dataContract
   * @returns {ValidationResult}
   */
  async function validateDataContractMaxDepth(dataContract) {
    const result = new ValidationResult();

    let dereferencedDataContract;

    try {
      dereferencedDataContract = await refParser.dereference(dataContract, {
        dereference: {
          circular: false, // Don't allow circular $refs
        },
      });
    } catch (error) {
      result.addError(new JsonSchemaError(error));
    }

    try {
      checkMaxDepth(dereferencedDataContract);
    } catch (error) {
      result.addError(error);
    }

    return result;
  }

  return validateDataContractMaxDepth;
}

module.exports = validateDataContractMaxDepthFactory;
