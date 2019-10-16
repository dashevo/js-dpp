const MissingOptionError = require('../errors/MissingOptionError');

const StateTransitionFactory = require('./StateTransitionFactory');

const AbstractStateTransition = require('./AbstractStateTransition');

const stateTransitionTypes = require('./stateTransitionTypes');

const dataContractStateTransitionSchema = require('../../schema/stateTransition/data-contract');

const createDataContract = require('../dataContract/createDataContract');
const createStateTransitionFactory = require('./createStateTransitionFactory');
const validateDataContractFactory = require('../dataContract/validateDataContractFactory');
const validateDataContractSTStructureFactory = require('../dataContract/stateTransition/validateDataContractSTStructureFactory');
const validateStateTransitionStructureFactory = require('./validate/validateStateTransitionStructureFactory');
const validateDataContractSTDataFactory = require('../dataContract/stateTransition/validateDataContractSTDataFactory');
const validateStateTransitionDataFactory = require('./validate/validateStateTransitionDataFactory');

class StateTransitionFacade {
  /**
   * @param {DashPlatformProtocol} dpp
   * @param {JsonSchemaValidator} validator
   */
  constructor(dpp, validator) {
    this.dpp = dpp;

    const validateDataContract = validateDataContractFactory(
      validator,
    );

    const validateDataContractSTStructure = validateDataContractSTStructureFactory(
      validateDataContract,
    );

    const typeExtensions = {
      [stateTransitionTypes.DATA_CONTRACT]: {
        function: validateDataContractSTStructure,
        schema: dataContractStateTransitionSchema,
      },
    };

    this.validateStateTransitionStructure = validateStateTransitionStructureFactory(
      validator,
      typeExtensions,
    );

    this.createStateTransition = createStateTransitionFactory(
      createDataContract,
    );

    this.factory = new StateTransitionFactory(
      this.validateStateTransitionStructure,
      this.createStateTransition,
    );
  }

  /**
   * Create State Transition from plain object
   *
   * @param {RawDataContractStateTransition} rawStateTransition
   * @param {Object} options
   * @param {boolean} [options.skipValidation=false]
   * @return {DataContractStateTransition}
   */
  createFromObject(rawStateTransition, options = {}) {
    return this.factory.createFromObject(rawStateTransition, options);
  }

  /**
   * Create State Transition from string/buffer
   *
   * @param {Buffer|string} payload
   * @param {Object} options
   * @param {boolean} [options.skipValidation=false]
   * @return {DataContractStateTransition}
   */
  createFromSerialized(payload, options = {}) {
    return this.factory.createFromSerialized(payload, options);
  }

  /**
   * Validate Data Contract
   *
   * @param {DataContractStateTransition|RawDataContractStateTransition} stateTransition
   * @param {Object} options
   * @param {boolean=false} options.skipStructureValidation
   * @return {ValidationResult}
   */
  async validate(stateTransition, options = {}) {
    const opts = Object.assign({ skipStructureValidation: false }, options);

    if (!opts.skipStructureValidation) {
      const result = this.validateStateTransitionStructure(stateTransition);

      if (!result.isValid()) {
        return result;
      }
    }

    let stateTransitionModel = stateTransition;

    if (!(stateTransition instanceof AbstractStateTransition)) {
      stateTransitionModel = this.createStateTransition(stateTransition);
    }

    const validateStateTransitionData = this.createValidateStateTransitionData();

    return validateStateTransitionData(stateTransitionModel);
  }

  /**
   * @private
   * @return {validateStateTransitionData}
   */
  createValidateStateTransitionData() {
    const dataProvider = this.dpp.getDataProvider();

    if (!dataProvider) {
      throw new MissingOptionError(
        'dataProvider',
        'Can\'t validate State Transition data because Data Provider is not set, use'
        + ' setDataProvider method',
      );
    }

    const validateDataContractSTData = validateDataContractSTDataFactory(
      dataProvider,
    );

    return validateStateTransitionDataFactory(
      validateDataContractSTData,
    );
  }
}

module.exports = StateTransitionFacade;
