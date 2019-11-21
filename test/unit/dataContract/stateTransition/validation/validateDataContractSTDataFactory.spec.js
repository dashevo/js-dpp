const { PrivateKey } = require('@dashevo/dashcore-lib');

const validateDataContractSTDataFactory = require('../../../../../lib/dataContract/stateTransition/validation/validateDataContractSTDataFactory');
const DataContractStateTransition = require('../../../../../lib/dataContract/stateTransition/DataContractStateTransition');

const Identity = require('../../../../../lib/identity/Identity');

const createDataProviderMock = require('../../../../../lib/test/mocks/createDataProviderMock');
const getDataContractFixture = require('../../../../../lib/test/fixtures/getDataContractFixture');

const { expectValidationError } = require('../../../../../lib/test/expect/expectError');

const ValidationResult = require('../../../../../lib/validation/ValidationResult');

const DataContractAlreadyPresentError = require('../../../../../lib/errors/DataContractAlreadyPresentError');
const InvalidStateTransitionSignatureError = require('../../../../../lib/errors/InvalidStateTransitionSignatureError');
const ConsensusError = require('../../../../../lib/errors/ConsensusError');

const signatureTypes = require('../../../../../lib/stateTransition/signatureTypes');

describe('validateDataContractSTDataFactory', () => {
  let validateDataContractSTData;
  let dataContract;
  let stateTransition;
  let dataProviderMock;
  let rawIdentity;
  let validateIdentityExistenceAndTypeMock;

  beforeEach(function beforeEach() {
    dataProviderMock = createDataProviderMock(this.sinonSandbox);

    validateIdentityExistenceAndTypeMock = this.sinonSandbox.stub().resolves(
      new ValidationResult(),
    );

    const privateKey = new PrivateKey();
    const publicKey = privateKey.toPublicKey().toBuffer().toString('base64');

    const getPublicKeyById = this.sinonSandbox.stub().returns({
      publicKey,
    });

    const publicKeyId = 1;

    rawIdentity = {
      id: 'iTYF+bWBA4MYRURcsBpBkgfwiqV7sYVnTDPR4uQ/KLU=',
      identityType: Identity.TYPES.APPLICATION,
      publicKeys: [
        {
          id: publicKeyId,
          publicKey,
          isEnabled: true,
        },
      ],
      getPublicKeyById,
    };

    dataContract = getDataContractFixture();
    stateTransition = new DataContractStateTransition(dataContract);
    stateTransition.sign({
      id: publicKeyId,
      userId: rawIdentity.id,
      type: signatureTypes.ECDSA,
      privateKey,
    });

    validateDataContractSTData = validateDataContractSTDataFactory(
      dataProviderMock,
      validateIdentityExistenceAndTypeMock,
    );

    dataProviderMock.fetchIdentity.resolves(rawIdentity);
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
    expect(dataProviderMock.fetchIdentity).to.not.be.called();
    expect(rawIdentity.getPublicKeyById).to.not.be.called();
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
    expect(dataProviderMock.fetchIdentity).to.not.be.called();
    expect(rawIdentity.getPublicKeyById).to.not.be.called();
  });

  it('should return valid result', async () => {
    const result = await validateDataContractSTData(stateTransition);

    expect(result).to.be.an.instanceOf(ValidationResult);
    expect(result.isValid()).to.be.true();

    expect(validateIdentityExistenceAndTypeMock).to.be.calledOnceWithExactly(
      dataContract.getId(), [Identity.TYPES.APPLICATION],
    );
    expect(dataProviderMock.fetchDataContract).to.be.calledOnceWithExactly(dataContract.getId());
    expect(dataProviderMock.fetchIdentity).to.be.calledOnceWithExactly(stateTransition.getUserId());
    expect(rawIdentity.getPublicKeyById).to.be.calledOnceWithExactly(
      stateTransition.getPublicKeyId(),
    );
  });

  it('should return invalid result on invalid signature', async () => {
    stateTransition.signature = 'invalidSignature';

    const result = await validateDataContractSTData(stateTransition);

    expect(result).to.be.an.instanceOf(ValidationResult);
    expect(result.isValid()).to.be.false();

    expectValidationError(result, InvalidStateTransitionSignatureError);

    const [error] = result.getErrors();

    expect(error.getRawStateTransition()).to.equal(stateTransition);
    expect(dataProviderMock.fetchDataContract).to.be.calledOnceWithExactly(dataContract.getId());
    expect(dataProviderMock.fetchIdentity).to.be.calledOnceWithExactly(stateTransition.getUserId());
    expect(rawIdentity.getPublicKeyById).to.be.calledOnceWithExactly(
      stateTransition.getPublicKeyId(),
    );
  });

  it('should return invalid result if state transition is not signed', async () => {
    stateTransition = new DataContractStateTransition(dataContract);

    const result = await validateDataContractSTData(stateTransition);

    expect(result).to.be.an.instanceOf(ValidationResult);
    expect(result.isValid()).to.be.false();

    expectValidationError(result, InvalidStateTransitionSignatureError);

    const [error] = result.getErrors();

    expect(error.getRawStateTransition()).to.equal(stateTransition);
    expect(dataProviderMock.fetchDataContract).to.be.calledOnceWithExactly(dataContract.getId());
    expect(dataProviderMock.fetchIdentity).to.be.calledOnceWithExactly(stateTransition.getUserId());
    expect(rawIdentity.getPublicKeyById).to.be.calledOnceWithExactly(
      stateTransition.getPublicKeyId(),
    );
  });
});
