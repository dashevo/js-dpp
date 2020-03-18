const $RefParser = require('json-schema-ref-parser');
const MissingOptionError = require('../errors/MissingOptionError');

const StateTransitionFactory = require('./StateTransitionFactory');

const AbstractStateTransition = require('./AbstractStateTransition');

const stateTransitionTypes = require('./stateTransitionTypes');

const dataContractStateTransitionSchema = require('../../schema/stateTransition/data-contract');
const documentsStateTransitionSchema = require('../../schema/stateTransition/documents');
const identityCreateTransitionSchema = require('../../schema/identity/state-transitions/identity-create');

const createStateTransitionFactory = require('./createStateTransitionFactory');
const validateDataContractFactory = require('../dataContract/validateDataContractFactory');
const validateDataContractSTStructureFactory = require('../dataContract/stateTransition/validation/validateDataContractSTStructureFactory');
const validateStateTransitionStructureFactory = require('./validation/validateStateTransitionStructureFactory');
const validateDataContractSTDataFactory = require('../dataContract/stateTransition/validation/validateDataContractSTDataFactory');
const validateStateTransitionDataFactory = require('./validation/validateStateTransitionDataFactory');
const validateDocumentsSTStructureFactory = require('../document/stateTransition/validation/structure/validateDocumentsSTStructureFactory');
const validateDocumentFactory = require('../document/validateDocumentFactory');
const validateIdentityCreateSTDataFactory = require('../identity/stateTransitions/identityCreateTransition/validateIdentityCreateSTDataFactory');
const validateIdentityCreateSTStructureFactory = require('../identity/stateTransitions/identityCreateTransition/validateIdentityCreateSTStructureFactory');
const validateStateTransitionSignatureFactory = require('../stateTransition/validation/validateStateTransitionSignatureFactory');
const validateStateTransitionFeeFactory = require('./validation/validateStateTransitionFeeFactory');

const fetchAndValidateDataContractFactory = require('../document/fetchAndValidateDataContractFactory');
const enrichDataContractWithBaseDocument = require('../dataContract/enrichDataContractWithBaseDocument');
const findDuplicateDocumentsById = require('../document/stateTransition/validation/structure/findDuplicateDocumentsById');
const findDuplicateDocumentsByIndices = require('../document/stateTransition/validation/structure/findDuplicateDocumentsByIndices');

const validateDocumentsSTDataFactory = require('../document/stateTransition/validation/data/validateDocumentsSTDataFactory');
const fetchDocumentsFactory = require('../document/stateTransition/validation/data/fetchDocumentsFactory');
const validateDocumentsUniquenessByIndicesFactory = require('../document/stateTransition/validation/data/validateDocumentsUniquenessByIndicesFactory');
const getDataTriggersFactory = require('../dataTrigger/getDataTriggersFactory');
const executeDataTriggersFactory = require('../document/stateTransition/validation/data/executeDataTriggersFactory');
const validateIdentityExistenceFactory = require('./validation/validateIdentityExistenceFactory');
const validatePublicKeysFactory = require('../identity/validation/validatePublicKeysFactory');
const validateDataContractMaxDepthFactory = require('../dataContract/stateTransition/validation/validateDataContractMaxDepthFactory');

class StateTransitionFacade {
  /**
   * @param {DataProvider} dataProvider
   * @param {JsonSchemaValidator} validator
   */
  constructor(dataProvider, validator) {
    this.dataProvider = dataProvider;
    this.validator = validator;

    const validateDataContractMaxDepth = validateDataContractMaxDepthFactory($RefParser);

    const validateDataContract = validateDataContractFactory(
      validator,
      validateDataContractMaxDepth,
      enrichDataContractWithBaseDocument,
    );

    const validateStateTransitionSignature = validateStateTransitionSignatureFactory(
      dataProvider,
    );

    const validateIdentityExistence = validateIdentityExistenceFactory(dataProvider);

    const validateDataContractSTStructure = validateDataContractSTStructureFactory(
      validateDataContract,
      validateStateTransitionSignature,
      validateIdentityExistence,
    );

    const validateDocument = validateDocumentFactory(
      this.validator,
      enrichDataContractWithBaseDocument,
    );

    this.createStateTransition = createStateTransitionFactory();

    const fetchAndValidateDataContract = fetchAndValidateDataContractFactory(
      dataProvider,
    );

    const validateDocumentsSTStructure = validateDocumentsSTStructureFactory(
      validateDocument,
      findDuplicateDocumentsById,
      findDuplicateDocumentsByIndices,
      fetchAndValidateDataContract,
      validateStateTransitionSignature,
      validateIdentityExistence,
    );

    const validatePublicKeys = validatePublicKeysFactory(
      validator,
    );

    const validateIdentityCreateSTStructure = validateIdentityCreateSTStructureFactory(
      validatePublicKeys,
    );

    const typeExtensions = {
      [stateTransitionTypes.DATA_CONTRACT]: {
        validationFunction: validateDataContractSTStructure,
        schema: dataContractStateTransitionSchema,
      },
      [stateTransitionTypes.DOCUMENTS]: {
        validationFunction: validateDocumentsSTStructure,
        schema: documentsStateTransitionSchema,
      },
      [stateTransitionTypes.IDENTITY_CREATE]: {
        validationFunction: validateIdentityCreateSTStructure,
        schema: identityCreateTransitionSchema,
      },
    };

    this.validateStateTransitionStructure = validateStateTransitionStructureFactory(
      validator,
      typeExtensions,
      this.createStateTransition,
    );

    const validateDataContractSTData = validateDataContractSTDataFactory(
      dataProvider,
    );

    const validateIdentityCreateSTData = validateIdentityCreateSTDataFactory(
      dataProvider,
    );

    const fetchDocuments = fetchDocumentsFactory(
      dataProvider,
    );

    const validateDocumentsUniquenessByIndices = validateDocumentsUniquenessByIndicesFactory(
      dataProvider,
    );

    const getDataTriggers = getDataTriggersFactory();

    const executeDataTriggers = executeDataTriggersFactory(
      getDataTriggers,
    );

    const validateDocumentsSTData = validateDocumentsSTDataFactory(
      dataProvider,
      fetchDocuments,
      validateDocumentsUniquenessByIndices,
      executeDataTriggers,
      fetchAndValidateDataContract,
    );

    this.validateStateTransitionData = validateStateTransitionDataFactory({
      [stateTransitionTypes.DATA_CONTRACT]: validateDataContractSTData,
      [stateTransitionTypes.DOCUMENTS]: validateDocumentsSTData,
      [stateTransitionTypes.IDENTITY_CREATE]: validateIdentityCreateSTData,
    });

    this.validateStateTransitionFee = validateStateTransitionFeeFactory(
      dataProvider,
    );

    this.factory = new StateTransitionFactory(
      this.validateStateTransitionStructure,
      this.createStateTransition,
    );
  }

  /**
   * Create State Transition from plain object
   *
   * @param {RawDataContractStateTransition|RawDocumentsStateTransition} rawStateTransition
   * @param {Object} options
   * @param {boolean} [options.skipValidation=false]
   * @return {DataContractStateTransition|DocumentsStateTransition}
   */
  async createFromObject(rawStateTransition, options = {}) {
    if (!this.dataProvider && !options.skipValidation) {
      throw new MissingOptionError(
        'dataProvider',
        'Can\'t create State Transition because Data Provider is not set, use'
        + ' setDataProvider method',
      );
    }

    return this.factory.createFromObject(rawStateTransition, options);
  }

  /**
   * Create State Transition from string/buffer
   *
   * @param {Buffer|string} payload
   * @param {Object} options
   * @param {boolean} [options.skipValidation=false]
   * @return {DataContractStateTransition|DocumentsStateTransition}
   */
  async createFromSerialized(payload, options = {}) {
    if (!this.dataProvider && !options.skipValidation) {
      throw new MissingOptionError(
        'dataProvider',
        'Can\'t create State Transition because Data Provider is not set, use'
        + ' setDataProvider method',
      );
    }

    return this.factory.createFromSerialized(payload, options);
  }

  /**
   * Validate State Transition
   *
   * @param {
   * DataContractStateTransition
   * |RawDataContractStateTransition
   * |DocumentsStateTransition
   * |RawDocumentsStateTransition
   * } stateTransition
   * @return {ValidationResult}
   */
  async validate(stateTransition) {
    const result = await this.validateStructure(stateTransition);

    if (!result.isValid()) {
      return result;
    }

    let stateTransitionModel = stateTransition;

    if (!(stateTransition instanceof AbstractStateTransition)) {
      stateTransitionModel = this.createStateTransition(stateTransition);
    }

    return this.validateData(stateTransitionModel);
  }

  /**
   * Validate State Transition Structure
   *
   * @param {
   *  DataContractStateTransition
   * |RawDataContractStateTransition
   * |RawDocumentsStateTransition
   * |DocumentsStateTransition
   * } stateTransition
   * @return {ValidationResult}
   */
  async validateStructure(stateTransition) {
    if (!this.dataProvider) {
      throw new MissingOptionError(
        'dataProvider',
        'Can\'t validate State Transition because Data Provider is not set, use'
        + ' setDataProvider method',
      );
    }

    return this.validateStateTransitionStructure(stateTransition);
  }

  /**
   * Validate State Transition Data
   *
   * @param {
   *  DataContractStateTransition|DocumentsStateTransition|IdentityCreateTransition
   *  |RawDataContractStateTransition|RawDocumentsStateTransition|RawIdentityCreateTransition
   *  } stateTransition
   * @return {ValidationResult}
   */
  async validateData(stateTransition) {
    if (!this.dataProvider) {
      throw new MissingOptionError(
        'dataProvider',
        'Can\'t validate State Transition because Data Provider is not set, use'
        + ' setDataProvider method',
      );
    }
    let stateTransitionModel = stateTransition;

    if (!(stateTransition instanceof AbstractStateTransition)) {
      stateTransitionModel = await this.createFromObject(stateTransition);
    }

    return this.validateStateTransitionData(stateTransitionModel);
  }

  /**
   * Validate State Transition Fee
   *
   * @return {ValidationResult}
   */
  async validateFee(stateTransition) {
    if (!this.dataProvider) {
      throw new MissingOptionError(
        'dataProvider',
        'Can\'t validate State Transition because Data Provider is not set, use'
        + ' setDataProvider method',
      );
    }

    let stateTransitionModel = stateTransition;

    if (!(stateTransition instanceof AbstractStateTransition)) {
      stateTransitionModel = await this.createFromObject(stateTransition);
    }

    return this.validateStateTransitionFee(stateTransitionModel);
  }
}

module.exports = StateTransitionFacade;
