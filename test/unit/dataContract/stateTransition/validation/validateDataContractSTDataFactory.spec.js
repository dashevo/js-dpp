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
  let rawIdentity;
  let validateIdentityTypeMock;

  beforeEach(function beforeEach() {
    dataProviderMock = createDataProviderMock(this.sinonSandbox);

    validateIdentityTypeMock = this.sinonSandbox.stub().resolves(new ValidationResult());

    rawIdentity = {
      id: 'iTYF+bWBA4MYRURcsBpBkgfwiqV7sYVnTDPR4uQ/KLU=',
      identityType: Identity.TYPES.APPLICATION,
      publicKeys: [
        {
          id: 1,
          publicKey: 'z3HAPrJkpgffXX0b3w0lb/PZs6A5IXzHj1p8Fnzmgmk=',
          isEnabled: true,
        },
      ],
    };

    dataContract = getDataContractFixture();
    stateTransition = new DataContractStateTransition(dataContract);

    validateDataContractSTData = validateDataContractSTDataFactory(
      dataProviderMock,
      validateIdentityTypeMock,
    );
  });

  it('should return invalid result if Data Contract Identity is invalid', async () => {
    const blockchainUserError = new ConsensusError('error');

    validateIdentityTypeMock.resolves(
      new ValidationResult([blockchainUserError]),
    );

    const result = await validateDataContractSTData(stateTransition);

    expectValidationError(result);

    const [error] = result.getErrors();

    expect(error).to.equal(blockchainUserError);

    expect(validateIdentityTypeMock).to.be.calledOnceWithExactly(
      dataContract.getId(), [Identity.TYPES.APPLICATION],
    );
    expect(dataProviderMock.fetchDataContract).to.not.be.called();
  });

  it('should return invalid result if Data Contract with specified contractId is already exist', async () => {
    dataProviderMock.fetchIdentity.resolves(rawIdentity);
    dataProviderMock.fetchDataContract.resolves(dataContract);

    const result = await validateDataContractSTData(stateTransition);

    expectValidationError(result, DataContractAlreadyPresentError);

    const [error] = result.getErrors();

    expect(error.getDataContract()).to.equal(dataContract);

    expect(validateIdentityTypeMock).to.be.calledOnceWithExactly(
      dataContract.getId(), [Identity.TYPES.APPLICATION],
    );
    expect(dataProviderMock.fetchDataContract).to.be.calledOnceWithExactly(dataContract.getId());
  });

  it('should return valid result', async () => {
    dataProviderMock.fetchIdentity.resolves(rawIdentity);

    const result = await validateDataContractSTData(stateTransition);

    expect(result).to.be.an.instanceOf(ValidationResult);
    expect(result.isValid()).to.be.true();

    expect(validateIdentityTypeMock).to.be.calledOnceWithExactly(
      dataContract.getId(), [Identity.TYPES.APPLICATION],
    );
    expect(dataProviderMock.fetchDataContract).to.be.calledOnceWithExactly(dataContract.getId());
  });
});
