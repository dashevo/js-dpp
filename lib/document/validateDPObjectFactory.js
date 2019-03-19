const Document = require('./Document');

const dpObjectBaseSchema = require('../../schema/base/dp-object');

const ValidationResult = require('../validation/ValidationResult');

const InvalidDocumentTypeError = require('../errors/InvalidDocumentTypeError');
const MissingDocumentTypeError = require('../errors/MissingDocumentTypeError');
const MissingDocumentActionError = require('../errors/MissingDocumentActionError');
const InvalidDocumentScopeIdError = require('../errors/InvalidDocumentScopeIdError');

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
        new MissingDocumentTypeError(rawDocument),
      );

      return result;
    }

    if (!Object.prototype.hasOwnProperty.call(rawDocument, '$action')) {
      result.addError(
        new MissingDocumentActionError(rawDocument),
      );

      return result;
    }

    if (!dpContract.isDPObjectDefined(rawDocument.$type)) {
      result.addError(
        new InvalidDocumentTypeError(rawDocument.$type, dpContract),
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
        new InvalidDocumentScopeIdError(rawDocument),
      );
    }

    return result;
  }

  return validateDPObject;
};
