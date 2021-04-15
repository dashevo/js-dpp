const { Transaction } = require('@dashevo/dashcore-lib');
const validateAssetLockTransactionFactory = require('../../../../../lib/identity/stateTransitions/assetLockProof/validateAssetLockTransactionFactory');
const createStateRepositoryMock = require('../../../../../lib/test/mocks/createStateRepositoryMock');
const ValidationResult = require('../../../../../lib/validation/ValidationResult');
const InvalidIdentityAssetLockTransactionError = require('../../../../../lib/errors/InvalidIdentityAssetLockTransactionError');
const IdentityAssetLockTransactionOutputNotFoundError = require('../../../../../lib/errors/IdentityAssetLockTransactionOutputNotFoundError');
const IdentityAssetLockTransactionOutPointAlreadyExistsError = require('../../../../../lib/errors/IdentityAssetLockTransactionOutPointAlreadyExistsError');

describe('validateAssetLockTransactionFactory', () => {
  let stateRepositoryMock;
  let validateAssetLockTransaction;
  let rawTransaction;
  let outputIndex;

  beforeEach(function beforeEach() {
    rawTransaction = '030000000137feb5676d0851337ea3c9a992496aab7a0b3eee60aeeb9774000b7f4bababa5000000006b483045022100d91557de37645c641b948c6cd03b4ae3791a63a650db3e2fee1dcf5185d1b10402200e8bd410bf516ca61715867666d31e44495428ce5c1090bf2294a829ebcfa4ef0121025c3cc7fbfc52f710c941497fd01876c189171ea227458f501afcb38a297d65b4ffffffff021027000000000000166a14152073ca2300a86b510fa2f123d3ea7da3af68dcf77cb0090a0000001976a914152073ca2300a86b510fa2f123d3ea7da3af68dc88ac00000000';
    outputIndex = 0;

    stateRepositoryMock = createStateRepositoryMock(this.sinonSandbox);

    stateRepositoryMock.isAssetLockTransactionOutPointAlreadyUsed.returns(false);

    validateAssetLockTransaction = validateAssetLockTransactionFactory(stateRepositoryMock);
  });

  it('should return InvalidIdentityAssetLockTransactionError on invalid transaction', async () => {
    rawTransaction = '030000000137feb5676d085133';

    const result = await validateAssetLockTransaction(rawTransaction, outputIndex);

    expect(result).to.be.an.instanceOf(ValidationResult);
    expect(result.isValid()).to.be.false();
    expect(result.getErrors()).to.be.an('array');
    expect(result.getErrors()).to.have.lengthOf(1);

    const [error] = result.getErrors();

    expect(error).to.be.an.instanceOf(InvalidIdentityAssetLockTransactionError);

    expect(result.getData()).to.be.undefined();
    expect(stateRepositoryMock.isAssetLockTransactionOutPointAlreadyUsed).to.not.be.called();
  });

  it('should return IdentityAssetLockTransactionOutputNotFoundError on invalid outputIndex', async () => {
    outputIndex = 42;
    const result = await validateAssetLockTransaction(rawTransaction, outputIndex);

    expect(result).to.be.an.instanceOf(ValidationResult);
    expect(result.isValid()).to.be.false();
    expect(result.getErrors()).to.be.an('array');
    expect(result.getErrors()).to.have.lengthOf(1);

    const [error] = result.getErrors();

    expect(error).to.be.an.instanceOf(IdentityAssetLockTransactionOutputNotFoundError);
    expect(error.getOutputIndex()).to.equal(outputIndex);

    expect(result.getData()).to.be.undefined();
    expect(stateRepositoryMock.isAssetLockTransactionOutPointAlreadyUsed).to.not.be.called();
  });

  it('should return IdentityAssetLockTransactionOutPointAlreadyExistsError if outPoint was already used', async () => {
    stateRepositoryMock.isAssetLockTransactionOutPointAlreadyUsed.returns(true);

    const result = await validateAssetLockTransaction(rawTransaction, outputIndex);

    expect(result).to.be.an.instanceOf(ValidationResult);
    expect(result.isValid()).to.be.false();
    expect(result.getErrors()).to.be.an('array');
    expect(result.getErrors()).to.have.lengthOf(1);

    const [error] = result.getErrors();

    expect(error).to.be.an.instanceOf(IdentityAssetLockTransactionOutPointAlreadyExistsError);

    const transaction = new Transaction(rawTransaction);

    expect(error.getOutPoint()).to.deep.equal(transaction.getOutPointBuffer(outputIndex));

    expect(result.getData()).to.be.undefined();
    expect(stateRepositoryMock.isAssetLockTransactionOutPointAlreadyUsed)
      .to.be.calledOnceWithExactly(
        transaction.getOutPointBuffer(outputIndex),
      );
  });

  it('should return valid result', async () => {
    const result = await validateAssetLockTransaction(rawTransaction, outputIndex);

    expect(result).to.be.an.instanceOf(ValidationResult);

    expect(result.isValid()).to.be.true();

    const initialTransaction = new Transaction(rawTransaction);
    const initialPublicKeyHash = initialTransaction.outputs[outputIndex].script.getData();

    expect(stateRepositoryMock.isAssetLockTransactionOutPointAlreadyUsed)
      .to.be.calledOnceWithExactly(
        initialTransaction.getOutPointBuffer(outputIndex),
      );

    const { transaction, publicKeyHash } = result.getData();
    expect(publicKeyHash).to.deep.equal(initialPublicKeyHash);
    expect(transaction).to.be.an.instanceOf(Transaction);
    expect(transaction.toJSON()).to.deep.equal(initialTransaction.toJSON());
  });
});
