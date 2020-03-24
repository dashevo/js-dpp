const validateStateTransitionFeeFactory = require('../../../../lib/stateTransition/validation/validateStateTransitionFeeFactory');

const createDataProviderMock = require('../../../../lib/test/mocks/createDataProviderMock');

const getIdentityFixture = require('../../../../lib/test/fixtures/getIdentityFixture');
const getDataContractFixture = require('../../../../lib/test/fixtures/getDataContractFixture');
const getDocumentsFixture = require('../../../../lib/test/fixtures/getDocumentsFixture');
const getIdentityCreateSTFixture = require('../../../../lib/test/fixtures/getIdentityCreateSTFixture');

const DataContractStateTransition = require('../../../../lib/dataContract/stateTransition/DataContractStateTransition');
const DocumentsStateTransition = require('../../../../lib/document/stateTransition/DocumentsStateTransition');

const { expectValidationError } = require('../../../../lib/test/expect/expectError');

const IdentityBalanceIsNotEnoughError = require('../../../../lib/errors/BalanceIsNotEnoughError');
const InvalidStateTransitionTypeError = require('../../../../lib/errors/InvalidStateTransitionTypeError');

const ValidationResult = require('../../../../lib/validation/ValidationResult');
const { RATIO } = require('../../../../lib/identity/creditsConverter');

describe('validateStateTransitionFeeFactory', () => {
  let dataProviderMock;
  let validateStateTransitionFee;

  let identity;
  let dataContract;
  let documents;
  let identityCreateST;
  let validateLockTransactionMock;
  let output;

  beforeEach(function beforeEach() {
    identityCreateST = getIdentityCreateSTFixture();

    const stSize = Buffer.byteLength(identityCreateST.serialize({ skipSignature: true }));

    output = {
      satoshis: Math.ceil(stSize / RATIO),
    };

    const validateLockTransactionResult = new ValidationResult();
    validateLockTransactionResult.setData(output);

    validateLockTransactionMock = this.sinonSandbox.stub().resolves(validateLockTransactionResult);
    identity = getIdentityFixture();
    dataProviderMock = createDataProviderMock(this.sinonSandbox);
    dataProviderMock.fetchIdentity.resolves(identity);
    validateStateTransitionFee = validateStateTransitionFeeFactory(
      dataProviderMock,
      validateLockTransactionMock,
    );
    dataContract = getDataContractFixture();
    documents = getDocumentsFixture();
  });

  it('should return invalid result if balance is not enough', async () => {
    const stateTransition = new DataContractStateTransition(dataContract);

    identity.balance = Buffer.byteLength(stateTransition.serialize({ skipSignature: true })) - 1;

    const result = await validateStateTransitionFee(stateTransition);

    expectValidationError(result, IdentityBalanceIsNotEnoughError);

    const [error] = result.getErrors();

    expect(error.getBalance()).to.equal(identity.balance);
  });

  it('should return valid result for DataContractStateTransition', async () => {
    const stateTransition = new DataContractStateTransition(dataContract);
    identity.balance = Buffer.byteLength(stateTransition.serialize({ skipSignature: true }));

    const result = await validateStateTransitionFee(stateTransition);

    expect(result.isValid()).to.be.true();
    expect(dataProviderMock.fetchIdentity).to.be.calledOnceWithExactly(dataContract.getOwnerId());
  });

  it('should return valid result for DocumentsStateTransition', async () => {
    const stateTransition = new DocumentsStateTransition(documents);
    identity.balance = Buffer.byteLength(stateTransition.serialize({ skipSignature: true }));

    const result = await validateStateTransitionFee(stateTransition);

    expect(result.isValid()).to.be.true();
    expect(dataProviderMock.fetchIdentity).to.be.calledOnceWithExactly(documents[0].getOwnerId());
  });

  it('should return valid result for IdentityCreateStateTransition', async () => {
    const result = await validateStateTransitionFee(identityCreateST);

    expect(result.isValid()).to.be.true();
    expect(validateLockTransactionMock).to.be.calledOnceWithExactly(identityCreateST);
  });

  it('should throw InvalidStateTransitionTypeError on invalid State Transition', async function it() {
    const rawStateTransitionMock = {
      data: 'sample data',
    };

    const stateTransitionMock = {
      getType: this.sinonSandbox.stub().returns(-1),
      serialize: this.sinonSandbox.stub().returns(Buffer.alloc(0)),
      toJSON: this.sinonSandbox.stub().returns(rawStateTransitionMock),
    };
    identity.balance = 0;

    try {
      await validateStateTransitionFee(stateTransitionMock);

      expect.fail('should throw InvalidStateTransitionTypeError');
    } catch (error) {
      expect(error).to.be.an.instanceOf(InvalidStateTransitionTypeError);
      expect(error.getRawStateTransition()).to.equal(rawStateTransitionMock);
    }

    expect(stateTransitionMock.getType).to.be.calledOnce();
    expect(stateTransitionMock.serialize).to.be.calledOnce();
  });
});
