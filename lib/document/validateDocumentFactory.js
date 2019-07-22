const Document = require('./Document');

const documentBaseSchema = require('../../schema/base/document');

const ValidationResult = require('../validation/ValidationResult');
const DataTriggerExecutionContext = require('../dataTrigger/Da');

const InvalidDocumentTypeError = require('../errors/InvalidDocumentTypeError');
const MissingDocumentTypeError = require('../errors/MissingDocumentTypeError');
const MissingDocumentActionError = require('../errors/MissingDocumentActionError');
const InvalidDocumentScopeIdError = require('../errors/InvalidDocumentScopeIdError');

const entropy = require('../util/entropy');

/**
 * @param {JsonSchemaValidator} validator
 * @param {enrichContractWithBaseDocument} enrichContractWithBaseDocument
 * @param {function(Document): DataTriggerExecutionResult} executeDataTriggers
 * @return {validateDocument}
 */
module.exports = function validateDocumentFactory(
  validator,
  enrichContractWithBaseDocument,
  executeDataTriggers,
) {
  /**
   * @typedef validateDocument
   * @param {Document|RawDocument} document
   * @param {Contract} contract
   * @param {Object} [options]
   * @param {boolean} [options.allowMeta=true]
   * @return {ValidationResult}
   */
  function validateDocument(document, contract, options = { allowMeta: true }) {
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

    if (!contract.isDocumentDefined(rawDocument.$type)) {
      result.addError(
        new InvalidDocumentTypeError(rawDocument.$type, contract),
      );

      return result;
    }

    if (rawDocument.$action === Document.ACTIONS.DELETE) {
      const schemaValidationResult = validator.validate(
        documentBaseSchema,
        rawDocument,
      );

      result.merge(schemaValidationResult);
    } else {
      const documentSchemaRef = contract.getDocumentSchemaRef(rawDocument.$type);

      const enrichedContract = enrichContractWithBaseDocument(
        contract,
        options.allowMeta ? [] : ['$meta'],
      );

      const additionalSchemas = {
        [contract.getJsonSchemaId()]: enrichedContract,
      };

      const schemaValidationResult = validator.validate(
        documentSchemaRef,
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

    const dataTriggers = getDataTriggers(contract);
    const context = new DataTriggerExecutionContext();
    dataTriggers.map(dataTrigger => {
      dataTrigger(document, context);
    });

    const dataTriggersExecutionResult = executeDataTriggers(document);
    if (dataTriggersExecutionResult.errors.length > 0) {
      result.addError(...dataTriggersExecutionResult.errors);
    }

    return result;
  }

  return validateDocument;
};
