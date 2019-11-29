const validateDataContractSTDataFactory = require('../../../../../lib/dataContract/stateTransition/validation/validateDataContractSTDataFactory');
const DataContractStateTransition = require('../../../../../lib/dataContract/stateTransition/DataContractStateTransition');

const Identity = require('../../../../../lib/identity/Identity');

const createDataProviderMock = require('../../../../../lib/test/mocks/createDataProviderMock');
const getDataContractFixture = require('../../../../../lib/test/fixtures/getDataContractFixture');

const { expectValidationError } = require('../../../../../lib/test/expect/expectError');

const ValidationResult = require('../../../../../lib/validation/ValidationResult');

const DataContractAlreadyPresentError = require('../../../../../lib/errors/DataContractAlreadyPresentError');
const ConsensusError = require('../../../../../lib/errors/ConsensusError');

describe('validateDataContractSTDataFactory', () => {
  let validateDataContractSTData;
  let dataContract;
  let stateTransition;
  let dataProviderMock;
  let validateIdentityExistenceAndTypeMock;

  beforeEach(function beforeEach() {
    dataProviderMock = createDataProviderMock(this.sinonSandbox);

    validateIdentityExistenceAndTypeMock = this.sinonSandbox.stub().resolves(
      new ValidationResult(),
    );

    dataContract = getDataContractFixture();
    stateTransition = new DataContractStateTransition(dataContract);

    validateDataContractSTData = validateDataContractSTDataFactory(
      dataProviderMock,
      validateIdentityExistenceAndTypeMock,
    );
  });

  it('should return invalid result if Data Contract Identity is invalid', async () => {
    const blockchainUserError = new ConsensusError('error');

    validateIdentityExistenceAndTypeMock.resolves(
      new ValidationResult([blockchainUserError]),
    );

    const result = await validateDataContractSTData(stateTransition);

    expectValidationError(result);

    const [error] = result.getErrors();

    expect(error).to.equal(blockchainUserError);

    expect(validateIdentityExistenceAndTypeMock).to.be.calledOnceWithExactly(
      dataContract.getId(), [Identity.TYPES.APPLICATION],
    );
    expect(dataProviderMock.fetchDataContract).to.not.be.called();
  });

  it('should return invalid result if Data Contract with specified contractId is already exist', async () => {
    dataProviderMock.fetchDataContract.resolves(dataContract);

    const result = await validateDataContractSTData(stateTransition);

    expectValidationError(result, DataContractAlreadyPresentError);

    const [error] = result.getErrors();

    expect(error.getDataContract()).to.equal(dataContract);

    expect(validateIdentityExistenceAndTypeMock).to.be.calledOnceWithExactly(
      dataContract.getId(), [Identity.TYPES.APPLICATION],
    );
    expect(dataProviderMock.fetchDataContract).to.be.calledOnceWithExactly(dataContract.getId());
  });

  it('should return valid result', async () => {
    const result = await validateDataContractSTData(stateTransition);

    expect(result).to.be.an.instanceOf(ValidationResult);
    expect(result.isValid()).to.be.true();

    expect(validateIdentityExistenceAndTypeMock).to.be.calledOnceWithExactly(
      dataContract.getId(), [Identity.TYPES.APPLICATION],
    );
    expect(dataProviderMock.fetchDataContract).to.be.calledOnceWithExactly(dataContract.getId());
  });
});
