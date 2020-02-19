const Ajv = require('ajv');
const $RefParser = require('json-schema-ref-parser');

const JsonSchemaValidator = require('./validation/JsonSchemaValidator');

const DataContractFacade = require('./dataContract/DataContractFacade');
const DocumentFacade = require('./document/DocumentFacade');
const StateTransitionFacade = require('./stateTransition/StateTransitionFacade');

const IdentityFacade = require('./identity/IdentityFacade');

const validateDataContractMaxDepthFactory = require('./dataContract/stateTransition/validation/validateDataContractMaxDepthFactory');

/**
 * @class DashPlatformProtocol
 */
class DashPlatformProtocol {
  /**
   * @param {Object} options
   * @param {DataProvider} [options.dataProvider]
   */
  constructor(options = {}) {
    this.dataProvider = options.dataProvider;

    const jsonSchemaValidator = new JsonSchemaValidator(new Ajv());

    const validateDataContractMaxDepth = validateDataContractMaxDepthFactory($RefParser);

    this.initializeFacades(
      jsonSchemaValidator,
      validateDataContractMaxDepth,
    );
  }

  /**
   * @private
   * @param {JsonSchemaValidator} jsonSchemaValidator
   * @param {validateDataContractMaxDepth} validateDataContractMaxDepth
   */
  initializeFacades(jsonSchemaValidator, validateDataContractMaxDepth) {
    this.dataContract = new DataContractFacade(
      jsonSchemaValidator,
      validateDataContractMaxDepth,
    );

    this.document = new DocumentFacade(this.dataProvider, jsonSchemaValidator);

    this.stateTransition = new StateTransitionFacade(this.dataProvider, jsonSchemaValidator);

    this.identity = new IdentityFacade(jsonSchemaValidator);
  }

  /**
   * Get Data Provider
   *
   * @return {DataProvider}
   */
  getDataProvider() {
    return this.dataProvider;
  }
}

module.exports = DashPlatformProtocol;
