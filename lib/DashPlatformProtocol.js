const createAjv = require('./validation/createAjv');

const JsonSchemaValidator = require('./validation/JsonSchemaValidator');

const DataContractFacade = require('./dataContract/DataContractFacade');
const DocumentFacade = require('./document/DocumentFacade');
const StateTransitionFacade = require('./stateTransition/StateTransitionFacade');

const IdentityFacade = require('./identity/IdentityFacade');

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

    const validator = new JsonSchemaValidator(createAjv());

    this.initializeFacades(validator);
  }

  /**
   * @private
   * @param {JsonSchemaValidator} validator
   */
  initializeFacades(validator) {
    this.dataContract = new DataContractFacade(validator);

    this.document = new DocumentFacade(this.dataProvider, validator);

    this.stateTransition = new StateTransitionFacade(this.dataProvider, validator);

    this.identity = new IdentityFacade(validator);
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
