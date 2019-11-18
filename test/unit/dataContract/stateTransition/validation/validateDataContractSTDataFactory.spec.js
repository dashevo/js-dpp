const validateDataContractSTDataFactory = require('../../../../../lib/dataContract/stateTransition/validation/validateDataContractSTDataFactory');
const DataContractStateTransition = require('../../../../../lib/dataContract/stateTransition/DataContractStateTransition');

const { IDENTITY_TYPES } = require('../../../../../lib/identity/constants');

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
  let registrationTransaction;
  let checkIdentityMock;

  beforeEach(function beforeEach() {
    dataProviderMock = createDataProviderMock(this.sinonSandbox);

    checkIdentityMock = this.sinonSandbox.stub().resolves(new ValidationResult());

    registrationTransaction = {
      confirmations: 6,
    };

    dataContract = getDataContractFixture();
    stateTransition = new DataContractStateTransition(dataContract);

    validateDataContractSTData = validateDataContractSTDataFactory(
      dataProviderMock,
      checkIdentityMock,
    );
  });

  it('should return invalid result if Data Contract Identity is invalid', async () => {
    const blockchainUserError = new ConsensusError('error');

    checkIdentityMock.resolves(
      new ValidationResult([blockchainUserError]),
    );

    const result = await validateDataContractSTData(stateTransition);

    expectValidationError(result);

    const [error] = result.getErrors();

    expect(error).to.equal(blockchainUserError);

    expect(checkIdentityMock).to.be.calledOnceWithExactly(
      dataContract.getId(), IDENTITY_TYPES.APPLICATION,
    );
    expect(dataProviderMock.fetchDataContract).to.not.be.called();
  });

  it('should return invalid result if Data Contract with specified contractId is already exist', async () => {
    dataProviderMock.fetchTransaction.resolves(registrationTransaction);
    dataProviderMock.fetchDataContract.resolves(dataContract);

    const result = await validateDataContractSTData(stateTransition);

    expectValidationError(result, DataContractAlreadyPresentError);

    const [error] = result.getErrors();

    expect(error.getDataContract()).to.equal(dataContract);

    expect(checkIdentityMock).to.be.calledOnceWithExactly(
      dataContract.getId(), IDENTITY_TYPES.APPLICATION,
    );
    expect(dataProviderMock.fetchDataContract).to.be.calledOnceWithExactly(dataContract.getId());
  });

  it('should return valid result', async () => {
    dataProviderMock.fetchTransaction.resolves(registrationTransaction);

    const result = await validateDataContractSTData(stateTransition);

    expect(result).to.be.an.instanceOf(ValidationResult);
    expect(result.isValid()).to.be.true();

    expect(checkIdentityMock).to.be.calledOnceWithExactly(
      dataContract.getId(), IDENTITY_TYPES.APPLICATION,
    );
    expect(dataProviderMock.fetchDataContract).to.be.calledOnceWithExactly(dataContract.getId());
  });
});
