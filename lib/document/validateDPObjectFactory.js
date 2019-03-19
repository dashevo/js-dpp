const Document = require('./Document');

const dpObjectBaseSchema = require('../../schema/base/dp-object');

const ValidationResult = require('../validation/ValidationResult');

const InvalidDPObjectTypeError = require('../errors/InvalidDPObjectTypeError');
const MissingDPObjectTypeError = require('../errors/MissingDPObjectTypeError');
const MissingDPObjectActionError = require('../errors/MissingDPObjectActionError');
const InvalidDPObjectScopeIdError = require('../errors/InvalidDPObjectScopeIdError');

const entropy = require('../util/entropy');

/**
 * @param {JsonSchemaValidator} validator
 * @param {enrichDPContractWithBaseDPObject} enrichDPContractWithBaseDPObject
 * @return {validateDPObject}
 */
module.exports = function validateDPObjectFactory(
  validator,
  enrichDPContractWithBaseDPObject,
) {
  /**
   * @typedef validateDPObject
   * @param {Object|Document} document
   * @param {DPContract} dpContract
   * @return {ValidationResult}
   */
  function validateDPObject(document, dpContract) {
    const rawDocument = (document instanceof Document) ? document.toJSON() : document;

    const result = new ValidationResult();

    if (!Object.prototype.hasOwnProperty.call(rawDocument, '$type')) {
      result.addError(
        new MissingDPObjectTypeError(rawDocument),
      );

      return result;
    }

    if (!Object.prototype.hasOwnProperty.call(rawDocument, '$action')) {
      result.addError(
        new MissingDPObjectActionError(rawDocument),
      );

      return result;
    }

    if (!dpContract.isDPObjectDefined(rawDocument.$type)) {
      result.addError(
        new InvalidDPObjectTypeError(rawDocument.$type, dpContract),
      );

      return result;
    }

    if (rawDocument.$action === Document.ACTIONS.DELETE) {
      const schemaValidationResult = validator.validate(
        dpObjectBaseSchema,
        rawDocument,
      );

      result.merge(schemaValidationResult);
    } else {
      const dpObjectSchemaRef = dpContract.getDPObjectSchemaRef(rawDocument.$type);

      const enrichedDPContract = enrichDPContractWithBaseDPObject(dpContract);

      const additionalSchemas = {
        [dpContract.getJsonSchemaId()]: enrichedDPContract,
      };

      const schemaValidationResult = validator.validate(
        dpObjectSchemaRef,
        rawDocument,
        additionalSchemas,
      );

      result.merge(schemaValidationResult);
    }

    if (!entropy.validate(rawDocument.$scopeId)) {
      result.addError(
        new InvalidDPObjectScopeIdError(rawDocument),
      );
    }

    return result;
  }

  return validateDPObject;
};
