const validateStateTransitionStructureFactory = require('../../../../lib/stateTransition/validation/validateStateTransitionStructureFactory');

const DataContractFactory = require('../../../../lib/dataContract/DataContractFactory');

const stateTransitionTypes = require('../../../../lib/stateTransition/stateTransitionTypes');

const getDataContractFixture = require('../../../../lib/test/fixtures/getDataContractFixture');

const StateTransitionMaxSizeExceededError = require('../../../../lib/errors/StateTransitionMaxSizeExceededError');

const {
  expectValidationError,
} = require('../../../../lib/test/expect/expectError');

const ValidationResult = require('../../../../lib/validation/ValidationResult');

const ConsensusError = require('../../../../lib/errors/ConsensusError');

describe('validateStateTransitionStructureFactory', () => {
  let validateStateTransitionStructure;
  let validationFunctionMock;
  let rawStateTransition;
  let dataContract;
  let dataContractFactory;
  let createStateTransitionMock;
  let stateTransition;

  beforeEach(function beforeEach() {
    validationFunctionMock = this.sinonSandbox.stub();

    const validationFunctionsByType = {
      [stateTransitionTypes.DATA_CONTRACT_CREATE]: validationFunctionMock,
    };

    dataContract = getDataContractFixture();

    const privateKey = '9b67f852093bc61cea0eeca38599dbfba0de28574d2ed9b99d10d33dc1bde7b2';

    dataContractFactory = new DataContractFactory(undefined);

    stateTransition = dataContractFactory.createStateTransition(dataContract);
    stateTransition.signByPrivateKey(privateKey);

    rawStateTransition = stateTransition.toObject();

    createStateTransitionMock = this.sinonSandbox.stub().resolves(stateTransition);

    validateStateTransitionStructure = validateStateTransitionStructureFactory(
      validationFunctionsByType,
      createStateTransitionMock,
    );
  });

  it('should return invalid result if ST is invalid against validation function', async () => {
    const extensionError = new ConsensusError('test');
    const extensionResult = new ValidationResult([
      extensionError,
    ]);

    validationFunctionMock.returns(extensionResult);

    const result = await validateStateTransitionStructure(rawStateTransition);

    expectValidationError(result);

    const [error] = result.getErrors();

    expect(error).to.equal(extensionError);

    expect(validationFunctionMock).to.be.calledOnceWith(rawStateTransition);
  });

  it('should return invalid result if ST size is more than 16 kb', async () => {
    const validationFunctionResult = new ValidationResult();

    validationFunctionMock.returns(validationFunctionResult);

    // generate big state transition
    for (let i = 0; i < 500; i++) {
      stateTransition.dataContract.documents[`anotherContract${i}`] = rawStateTransition.dataContract.documents.niceDocument;
    }

    const result = await validateStateTransitionStructure(
      rawStateTransition,
    );

    expectValidationError(result, StateTransitionMaxSizeExceededError);
  });

  it('should return valid result', async () => {
    const extensionResult = new ValidationResult();

    validationFunctionMock.returns(extensionResult);

    const result = await validateStateTransitionStructure(rawStateTransition);

    expect(result).to.be.an.instanceOf(ValidationResult);
    expect(result.isValid()).to.be.true();

    expect(validationFunctionMock).to.be.calledOnceWith(rawStateTransition);
  });
});
