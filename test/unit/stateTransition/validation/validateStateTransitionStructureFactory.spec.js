const Ajv = require('ajv');

const lodashCloneDeep = require('lodash.clonedeep');

const validateStateTransitionStructureFactory = require('../../../../lib/stateTransition/validation/validateStateTransitionStructureFactory');
const createStateTransitionFactory = require('../../../../lib/stateTransition/createStateTransitionFactory');

const JsonSchemaValidator = require('../../../../lib/validation/JsonSchemaValidator');

const DataContractFactory = require('../../../../lib/dataContract/DataContractFactory');
const DocumentFactory = require('../../../../lib/document/DocumentFactory');

const stateTransitionTypes = require('../../../../lib/stateTransition/stateTransitionTypes');

const dataContractCreateTransitionSchema = require('../../../../schema/dataContract/stateTransition/dataContractCreate.json');
const documentsBatchTransitionSchema = require('../../../../schema/document/stateTransition/documentsBatch.json');
const identityCreateTransitionSchema = require('../../../../schema/identity/stateTransition/identityCreate.json');

const getDataContractFixture = require('../../../../lib/test/fixtures/getDataContractFixture');
const getDocumentsFixture = require('../../../../lib/test/fixtures/getDocumentsFixture');
const getIdentityCreateSTFixture = require('../../../../lib/test/fixtures/getIdentityCreateSTFixture');
const getIdentityTopUpTransitionFixture = require('../../../../lib/test/fixtures/getIdentityTopUpTransitionFixture');

const createStateRepositoryMock = require('../../../../lib/test/mocks/createStateRepositoryMock');

const dataContractExtensionSchema = require('../../../../schema/dataContract/stateTransition/dataContractCreate.json');
const identityTopUpTransitionSchema = require('../../../../schema/identity/stateTransition/identityTopUp.json');

const StateTransitionMaxSizeExceededError = require('../../../../lib/errors/StateTransitionMaxSizeExceededError');

const {
  expectValidationError,
  expectJsonSchemaError,
} = require('../../../../lib/test/expect/expectError');

const ValidationResult = require('../../../../lib/validation/ValidationResult');

const ConsensusError = require('../../../../lib/errors/ConsensusError');
const MissingStateTransitionTypeError = require('../../../../lib/errors/MissingStateTransitionTypeError');
const InvalidStateTransitionTypeError = require('../../../../lib/errors/InvalidStateTransitionTypeError');

describe('validateStateTransitionStructureFactory', () => {
  let validateStateTransitionStructure;
  let validator;
  let extensionFunctionMock;
  let rawStateTransition;
  let dataContract;
  let dataContractFactory;
  let privateKey;
  let createStateTransition;
  let stateRepositoryMock;

  beforeEach(function beforeEach() {
    extensionFunctionMock = this.sinonSandbox.stub();

    const typeExtensions = {
      [stateTransitionTypes.DATA_CONTRACT_CREATE]: {
        validationFunction: extensionFunctionMock,
        schema: dataContractExtensionSchema,
      },
    };

    const ajv = new Ajv();
    validator = new JsonSchemaValidator(ajv);

    dataContract = getDataContractFixture();

    privateKey = '9b67f852093bc61cea0eeca38599dbfba0de28574d2ed9b99d10d33dc1bde7b2';

    dataContractFactory = new DataContractFactory(undefined);

    const dataContractCreateTransition = dataContractFactory.createStateTransition(dataContract);
    dataContractCreateTransition.signByPrivateKey(privateKey);

    rawStateTransition = dataContractCreateTransition.toJSON();

    stateRepositoryMock = createStateRepositoryMock(this.sinonSandbox);
    stateRepositoryMock.fetchDataContract.resolves(dataContract);

    createStateTransition = createStateTransitionFactory(stateRepositoryMock);

    validateStateTransitionStructure = validateStateTransitionStructureFactory(
      validator,
      typeExtensions,
      createStateTransition,
    );
  });

  describe('Identity Create Transition', () => {
    beforeEach(() => {
      const typeExtensions = {
        [stateTransitionTypes.IDENTITY_CREATE]: {
          validationFunction: extensionFunctionMock,
          schema: identityCreateTransitionSchema,
        },
      };

      validateStateTransitionStructure = validateStateTransitionStructureFactory(
        validator,
        typeExtensions,
        createStateTransition,
      );

      const stateTransition = getIdentityCreateSTFixture();
      stateTransition.signByPrivateKey(privateKey);

      rawStateTransition = stateTransition.toJSON();
    });

    describe('protocolVersion', () => {
      it('should be present', async () => {
        delete rawStateTransition.protocolVersion;

        const result = await validateStateTransitionStructure(rawStateTransition);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('');
        expect(error.keyword).to.equal('required');
        expect(error.params.missingProperty).to.equal('protocolVersion');
      });

      it('should be an integer', async () => {
        rawStateTransition.protocolVersion = '1';

        const result = await validateStateTransitionStructure(rawStateTransition);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.protocolVersion');
        expect(error.keyword).to.equal('type');
      });

      it('should not be less than 0', async () => {
        rawStateTransition.protocolVersion = -1;

        const result = await validateStateTransitionStructure(rawStateTransition);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.keyword).to.equal('minimum');
        expect(error.dataPath).to.equal('.protocolVersion');
      });

      it('should not be greater than current version (0)', async () => {
        rawStateTransition.protocolVersion = 1;

        const result = await validateStateTransitionStructure(rawStateTransition);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.keyword).to.equal('maximum');
        expect(error.dataPath).to.equal('.protocolVersion');
      });
    });

    describe('lockedOutPoint', () => {
      it('should be present', async () => {
        rawStateTransition.lockedOutPoint = undefined;

        const result = await validateStateTransitionStructure(
          rawStateTransition,
        );

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('');
        expect(error.params.missingProperty).to.equal('lockedOutPoint');
        expect(error.keyword).to.equal('required');

        expect(extensionFunctionMock).to.not.be.called();
      });

      it('should not be less than 48 characters in length', async () => {
        rawStateTransition.lockedOutPoint = '1';

        const result = await validateStateTransitionStructure(
          rawStateTransition,
        );

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.keyword).to.equal('minLength');
        expect(error.dataPath).to.equal('.lockedOutPoint');

        expect(extensionFunctionMock).to.not.be.called();
      });

      it('should not be more than 48 characters in length', async () => {
        rawStateTransition.lockedOutPoint = Buffer.alloc(48).toString('base64');

        const result = await validateStateTransitionStructure(
          rawStateTransition,
        );

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.keyword).to.equal('maxLength');
        expect(error.dataPath).to.equal('.lockedOutPoint');

        expect(extensionFunctionMock).to.not.be.called();
      });

      it('should be base64 encoded', async () => {
        rawStateTransition.lockedOutPoint = '&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&';

        const result = await validateStateTransitionStructure(
          rawStateTransition,
        );

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.keyword).to.equal('pattern');
        expect(error.dataPath).to.equal('.lockedOutPoint');

        expect(extensionFunctionMock).to.not.be.called();
      });
    });

    describe('publicKeys', () => {
      it('should be present', async () => {
        rawStateTransition.publicKeys = undefined;

        const result = await validateStateTransitionStructure(
          rawStateTransition,
        );

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('');
        expect(error.params.missingProperty).to.equal('publicKeys');
        expect(error.keyword).to.equal('required');

        expect(extensionFunctionMock).to.not.be.called();
      });

      it('should not be empty', async () => {
        rawStateTransition.publicKeys = [];

        const result = await validateStateTransitionStructure(
          rawStateTransition,
        );

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.keyword).to.equal('minItems');
        expect(error.dataPath).to.equal('.publicKeys');

        expect(extensionFunctionMock).to.not.be.called();
      });

      it('should not have more than 10 items', async () => {
        const [key] = rawStateTransition.publicKeys;

        for (let i = 0; i < 10; i++) {
          rawStateTransition.publicKeys.push(key);
        }

        const result = await validateStateTransitionStructure(
          rawStateTransition,
        );

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.keyword).to.equal('maxItems');
        expect(error.dataPath).to.equal('.publicKeys');

        expect(extensionFunctionMock).to.not.be.called();
      });
    });

    it('should be valid', async () => {
      extensionFunctionMock.returns(new ValidationResult());

      const result = await validateStateTransitionStructure(
        rawStateTransition,
      );

      expect(result).to.be.an.instanceOf(ValidationResult);
      expect(result.isValid()).to.be.true();

      expect(extensionFunctionMock).to.be.calledOnceWith(rawStateTransition);
    });

    it('should be unique', async () => {
      rawStateTransition.publicKeys.push(rawStateTransition.publicKeys[0]);

      const result = await validateStateTransitionStructure(
        rawStateTransition,
      );

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.keyword).to.equal('uniqueItems');
      expect(error.dataPath).to.equal('.publicKeys');

      expect(extensionFunctionMock).to.not.be.called();
    });
  });

  describe('Identity TopUp Transition', () => {
    beforeEach(() => {
      const typeExtensions = {
        [stateTransitionTypes.IDENTITY_TOP_UP]: {
          validationFunction: extensionFunctionMock,
          schema: identityTopUpTransitionSchema,
        },
      };

      validateStateTransitionStructure = validateStateTransitionStructureFactory(
        validator,
        typeExtensions,
        createStateTransition,
      );

      const stateTransition = getIdentityTopUpTransitionFixture();
      stateTransition.signByPrivateKey(privateKey);

      rawStateTransition = stateTransition.toJSON();
    });

    describe('protocolVersion', () => {
      it('should be present', async () => {
        delete rawStateTransition.protocolVersion;

        const result = await validateStateTransitionStructure(rawStateTransition);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('');
        expect(error.keyword).to.equal('required');
        expect(error.params.missingProperty).to.equal('protocolVersion');
      });

      it('should be an integer', async () => {
        rawStateTransition.protocolVersion = '1';

        const result = await validateStateTransitionStructure(rawStateTransition);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.protocolVersion');
        expect(error.keyword).to.equal('type');
      });

      it('should not be less than 0', async () => {
        rawStateTransition.protocolVersion = -1;

        const result = await validateStateTransitionStructure(rawStateTransition);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.keyword).to.equal('minimum');
        expect(error.dataPath).to.equal('.protocolVersion');
      });

      it('should not be greater than current version (0)', async () => {
        rawStateTransition.protocolVersion = 1;

        const result = await validateStateTransitionStructure(rawStateTransition);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.keyword).to.equal('maximum');
        expect(error.dataPath).to.equal('.protocolVersion');
      });
    });

    describe('lockedOutPoint', () => {
      it('should be present', async () => {
        rawStateTransition.lockedOutPoint = undefined;

        const result = await validateStateTransitionStructure(
          rawStateTransition,
        );

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('');
        expect(error.params.missingProperty).to.equal('lockedOutPoint');
        expect(error.keyword).to.equal('required');

        expect(extensionFunctionMock).to.not.be.called();
      });

      it('should not be less than 48 characters in length', async () => {
        rawStateTransition.lockedOutPoint = '1';

        const result = await validateStateTransitionStructure(
          rawStateTransition,
        );

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.keyword).to.equal('minLength');
        expect(error.dataPath).to.equal('.lockedOutPoint');

        expect(extensionFunctionMock).to.not.be.called();
      });

      it('should not be more than 48 characters in length', async () => {
        rawStateTransition.lockedOutPoint = Buffer.alloc(48).toString('base64');

        const result = await validateStateTransitionStructure(
          rawStateTransition,
        );

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.keyword).to.equal('maxLength');
        expect(error.dataPath).to.equal('.lockedOutPoint');

        expect(extensionFunctionMock).to.not.be.called();
      });

      it('should be base64 encoded', async () => {
        rawStateTransition.lockedOutPoint = '&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&';

        const result = await validateStateTransitionStructure(
          rawStateTransition,
        );

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.keyword).to.equal('pattern');
        expect(error.dataPath).to.equal('.lockedOutPoint');

        expect(extensionFunctionMock).to.not.be.called();
      });
    });

    it('should be valid', async () => {
      extensionFunctionMock.returns(new ValidationResult());

      const result = await validateStateTransitionStructure(
        rawStateTransition,
      );

      expect(result).to.be.an.instanceOf(ValidationResult);
      expect(result.isValid()).to.be.true();

      expect(extensionFunctionMock).to.be.calledOnceWith(rawStateTransition);
    });
  });

  it('should return invalid result if ST invalid against extension schema', async () => {
    delete rawStateTransition.dataContract;

    const result = await validateStateTransitionStructure(rawStateTransition);

    expectJsonSchemaError(result);

    const [error] = result.getErrors();

    expect(error.dataPath).to.equal('');
    expect(error.keyword).to.equal('required');
    expect(error.params.missingProperty).to.equal('dataContract');

    expect(extensionFunctionMock).to.not.be.called();
  });

  it('should return invalid result if ST is invalid against extension function', async () => {
    const extensionError = new ConsensusError('test');
    const extensionResult = new ValidationResult([
      extensionError,
    ]);

    extensionFunctionMock.returns(extensionResult);

    const result = await validateStateTransitionStructure(rawStateTransition);

    expectValidationError(result);

    const [error] = result.getErrors();

    expect(error).to.equal(extensionError);

    expect(extensionFunctionMock).to.be.calledOnceWith(rawStateTransition);
  });

  it('should return invalid result if ST size is more than 16 kb', async () => {
    const extensionResult = new ValidationResult();

    extensionFunctionMock.returns(extensionResult);

    rawStateTransition = lodashCloneDeep(rawStateTransition);

    // generate big state transition
    for (let i = 0; i < 500; i++) {
      rawStateTransition.dataContract.documents[`anotherContract${i}`] = rawStateTransition.dataContract.documents.niceDocument;
    }

    const result = await validateStateTransitionStructure(
      rawStateTransition,
    );

    expectValidationError(result, StateTransitionMaxSizeExceededError);
  });

  it('should return valid result', async () => {
    const extensionResult = new ValidationResult();

    extensionFunctionMock.returns(extensionResult);

    const result = await validateStateTransitionStructure(rawStateTransition);

    expect(result).to.be.an.instanceOf(ValidationResult);
    expect(result.isValid()).to.be.true();

    expect(extensionFunctionMock).to.be.calledOnceWith(rawStateTransition);
  });
});
