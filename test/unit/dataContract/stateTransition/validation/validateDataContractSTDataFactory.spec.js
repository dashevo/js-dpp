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
const SignatureVerificationError = require('../../../../../lib/errors/SignatureVerificationError');
const ConsensusError = require('../../../../../lib/errors/ConsensusError');
const InvalidIdentityPublicKeyType = require('../../../../../lib/errors/InvalidIdentityPublicKeyType');

const IdentityPublicKey = require('../../../../../lib/identity/IdentityPublicKey');

describe('validateDataContractSTDataFactory', () => {
  let validateDataContractSTData;
  let dataContract;
  let stateTransition;
  let dataProviderMock;
  let rawIdentity;
  let validateIdentityExistenceAndTypeMock;
  let identityPublicKey;

  beforeEach(function beforeEach() {
    dataProviderMock = createDataProviderMock(this.sinonSandbox);

    validateIdentityExistenceAndTypeMock = this.sinonSandbox.stub().resolves(
      new ValidationResult(),
    );

    const privateKeyModel = new PrivateKey();
    const privateKey = privateKeyModel.toBuffer();
    const publicKey = privateKeyModel.toPublicKey().toBuffer().toString('base64');
    const publicKeyId = 1;

    identityPublicKey = new IdentityPublicKey()
      .setId(publicKeyId)
      .setType(IdentityPublicKey.TYPES.ECDSA_SECP256K1)
      .setData(publicKey);

    const getPublicKeyById = this.sinonSandbox.stub().returns(identityPublicKey);

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
    stateTransition.sign(identityPublicKey, privateKey);

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
    dataProviderMock.fetchIdentity.resolves(rawIdentity);
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
    dataProviderMock.fetchIdentity.resolves(rawIdentity);

    const result = await validateDataContractSTData(stateTransition);

    expect(result).to.be.an.instanceOf(ValidationResult);
    expect(result.isValid()).to.be.true();

    expect(validateIdentityExistenceAndTypeMock).to.be.calledOnceWithExactly(
      dataContract.getId(), [Identity.TYPES.APPLICATION],
    );
    expect(dataProviderMock.fetchDataContract).to.be.calledOnceWithExactly(dataContract.getId());
    expect(rawIdentity.getPublicKeyById).to.be.calledOnceWithExactly(
      stateTransition.getSignaturePublicKeyId(),
    );
  });

  it('should return invalid result on invalid signature', async () => {
    stateTransition.signature = 'invalidSignature';

    const result = await validateDataContractSTData(stateTransition);

    expect(result).to.be.an.instanceOf(ValidationResult);
    expect(result.isValid()).to.be.false();

    expectValidationError(result, ConsensusError, 2);

    const [firstError, secondError] = result.getErrors();

    expect(dataProviderMock.fetchDataContract).to.be.calledOnceWithExactly(dataContract.getId());
    expect(rawIdentity.getPublicKeyById).to.be.calledOnceWithExactly(
      stateTransition.getSignaturePublicKeyId(),
    );

    expect(firstError).to.be.an.instanceof(SignatureVerificationError);
    expect(firstError.getSignature()).to.equal(stateTransition.signature);

    expect(secondError).to.be.an.instanceof(InvalidStateTransitionSignatureError);
    expect(secondError.getRawStateTransition()).to.equal(stateTransition);
  });

  it('should return invalid result if public key has wrong type', async () => {
    const type = 30000;
    identityPublicKey.setType(type);

    const result = await validateDataContractSTData(stateTransition);

    expect(result).to.be.an.instanceOf(ValidationResult);
    expect(result.isValid()).to.be.false();

    expectValidationError(result, InvalidIdentityPublicKeyType);

    const [error] = result.getErrors();

    expect(error.getType()).to.equal(type);
    expect(dataProviderMock.fetchDataContract).to.be.calledOnceWithExactly(dataContract.getId());
    expect(rawIdentity.getPublicKeyById).to.be.calledOnceWithExactly(
      stateTransition.getSignaturePublicKeyId(),
    );
  });
});
