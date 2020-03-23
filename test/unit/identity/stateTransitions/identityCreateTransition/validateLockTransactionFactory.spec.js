const WrongOutPointError = require('@dashevo/dashcore-lib/lib/errors/WrongOutPointError');

const validateLockTransactionFactory = require('../../../../../lib/identity/stateTransitions/identityCreateTransition/validateLockTransactionFactory');
const IdentityCreateTransition = require('../../../../../lib/identity/stateTransitions/identityCreateTransition/IdentityCreateTransition');
const stateTransitionTypes = require('../../../../../lib/stateTransition/stateTransitionTypes');

const { expectValidationError } = require(
  '../../../../../lib/test/expect/expectError',
);

const createDataProviderMock = require('../../../../../lib/test/mocks/createDataProviderMock');

const InvalidIdentityOutPointError = require(
  '../../../../../lib/errors/InvalidIdentityOutPointError',
);

const InvalidIdentityLockTransactionError = require('../../../../../lib/errors/InvalidIdentityLockTransactionError');

const IdentityLockTransactionNotFoundError = require(
  '../../../../../lib/errors/IdentityLockTransactionNotFoundError',
);

const InvalidStateTransitionSignatureError = require(
  '../../../../../lib/errors/InvalidStateTransitionSignatureError',
);

describe('validateLockTransactionFactory', () => {
  let transactionHash;
  let validateLockTransaction;
  let dataProviderMock;
  let stateTransition;
  let parseOutPointBufferMock;
  let lockedOutPointBuffer;
  let outputIndex;
  let privateKey;

  beforeEach(function beforeEach() {
    privateKey = 'af432c476f65211f45f48f1d42c9c0b497e56696aa1736b40544ef1a496af837';

    stateTransition = new IdentityCreateTransition({
      protocolVersion: 0,
      type: stateTransitionTypes.IDENTITY_CREATE,
      lockedOutPoint: 'azW1UgBiB0CmdphN6of4DbT91t0Xv3/c3YUV4CnoV/kAAAAA',
      publicKeys: [
        {
          id: 1,
          type: 1,
          data: 'Alw8x/v8UvcQyUFJf9AYdsGJFx6iJ0WPUBr8s4opfWW0',
          isEnabled: true,
        },
      ],
    });
    stateTransition.signByPrivateKey(privateKey);

    lockedOutPointBuffer = Buffer.from(stateTransition.getLockedOutPoint(), 'base64');

    const rawTransaction = '030000000137feb5676d0851337ea3c9a992496aab7a0b3eee60aeeb9774000b7f4bababa5000000006b483045022100d91557de37645c641b948c6cd03b4ae3791a63a650db3e2fee1dcf5185d1b10402200e8bd410bf516ca61715867666d31e44495428ce5c1090bf2294a829ebcfa4ef0121025c3cc7fbfc52f710c941497fd01876c189171ea227458f501afcb38a297d65b4ffffffff021027000000000000166a14152073ca2300a86b510fa2f123d3ea7da3af68dcf77cb0090a0000001976a914152073ca2300a86b510fa2f123d3ea7da3af68dc88ac00000000';

    dataProviderMock = createDataProviderMock(this.sinonSandbox);
    dataProviderMock.fetchTransaction.resolves(rawTransaction);

    transactionHash = 'hash';
    outputIndex = 0;

    parseOutPointBufferMock = this.sinonSandbox.stub().returns({
      transactionHash,
      outputIndex,
    });

    validateLockTransaction = validateLockTransactionFactory(
      dataProviderMock,
      parseOutPointBufferMock,
    );
  });

  it('should return valid result', async () => {
    const result = await validateLockTransaction(stateTransition);

    expect(result.isValid()).to.be.true();

    expect(parseOutPointBufferMock).to.be.calledOnceWithExactly(lockedOutPointBuffer);
    expect(dataProviderMock.fetchTransaction).to.be.calledOnceWithExactly(transactionHash);
  });

  it('should return invalid result if state transition has wrong out point', async () => {
    const wrongOutPointError = new WrongOutPointError('Outpoint is wrong');

    parseOutPointBufferMock.throws(wrongOutPointError);

    const result = await validateLockTransaction(stateTransition);

    expectValidationError(result, InvalidIdentityOutPointError);

    const [error] = result.getErrors();

    expect(error.message).to.equal(`Invalid Identity out point: ${wrongOutPointError.message}`);
    expect(parseOutPointBufferMock).to.be.calledOnceWithExactly(lockedOutPointBuffer);
    expect(dataProviderMock.fetchTransaction).to.be.not.called(transactionHash);
  });

  it('should return invalid result if lock transaction is not found', async () => {
    dataProviderMock.fetchTransaction.resolves(null);

    const result = await validateLockTransaction(stateTransition);

    expectValidationError(result, IdentityLockTransactionNotFoundError);

    const [error] = result.getErrors();
    expect(error.getTransactionHash()).to.deep.equal(transactionHash);
    expect(parseOutPointBufferMock).to.be.calledOnceWithExactly(lockedOutPointBuffer);
    expect(dataProviderMock.fetchTransaction).to.be.calledOnceWithExactly(transactionHash);
  });

  it('should return InvalidIdentityLockTransaction error if transaction has no output with given index', async () => {
    outputIndex = 10;

    parseOutPointBufferMock.returns({
      transactionHash,
      outputIndex,
    });

    const result = await validateLockTransaction(stateTransition);

    expectValidationError(result, InvalidIdentityOutPointError);

    const [error] = result.getErrors();

    expect(error.message).to.equal(`Invalid Identity out point: Output with index ${outputIndex} not found`);

    expect(parseOutPointBufferMock).to.be.calledOnceWithExactly(lockedOutPointBuffer);
    expect(dataProviderMock.fetchTransaction).to.be.calledOnceWithExactly(transactionHash);
  });

  it('should return InvalidIdentityLockTransaction error if transaction output is not a valid OP_RETURN output', async () => {
    outputIndex = 1; // fixture output # 1 is not an OP_RETURN output

    parseOutPointBufferMock.returns({
      transactionHash,
      outputIndex,
    });

    const result = await validateLockTransaction(stateTransition);

    expectValidationError(result, InvalidIdentityLockTransactionError);

    const [error] = result.getErrors();

    expect(error.message).to.equal('Invalid identity lock transaction: Output is not a valid standard OP_RETURN output');

    expect(parseOutPointBufferMock).to.be.calledOnceWithExactly(lockedOutPointBuffer);
    expect(dataProviderMock.fetchTransaction).to.be.calledOnceWithExactly(transactionHash);
  });

  it('should return InvalidIdentityLockTransaction error if transaction output script data has size < 20', async () => {
    const rawTransaction = '0300000001ab9eafdc4318fb78f3c1d1dc6bf6e37339170810be031d0cb46cbdce6e155457000000006b483045022100832effb10710fd69399ee0d2a545eac3050e8b49f269a28fb77701411a4af90a02201f70042b2f86d3538e7b26e5995fa2fd5966ce6f5ec540e12d6e3dd5883855cb0121027a68d5e8adb9cd765166b8d7b143de26643617d5683a313960efe7a0267703d7ffffffff021027000000000000156a1300000000000000000000000000000000000000f77cb0090a0000001976a9140f25d6ad33b341e04ee91b693038e5e59d080c2688ac00000000';

    dataProviderMock.fetchTransaction.resolves(rawTransaction);

    const result = await validateLockTransaction(stateTransition);

    expectValidationError(result, InvalidIdentityLockTransactionError);

    const [error] = result.getErrors();

    expect(error.message).to.equal('Invalid identity lock transaction: Output has invalid public key hash');

    expect(parseOutPointBufferMock).to.be.calledOnceWithExactly(lockedOutPointBuffer);
    expect(dataProviderMock.fetchTransaction).to.be.calledOnceWithExactly(transactionHash);
  });

  it('should return InvalidIdentityLockTransaction error if transaction output script data has size > 20', async () => {
    const rawTransaction = '0300000001aa556096e53cced1a46b5fbcb5a250f4c6e85d45d844605a780b9ab03f9ad8f4000000006b483045022100d7e5bf5a77fa4dc10d0b0a90e8aba7646a24214df6d3195d86212ee7177b8d0402201bea80d1464ec70ae4484df3c81c5002d725941a91ea93db3c438b672d68f331012102a22559eb15862d37124dc205d62a6c9de4dd837aee6c0902c5e7589f723f9e88ffffffff021027000000000000176a15000000000000000000000000000000000000000000544a3ba40b0000001976a9140fdd198858cc7c4e1afdba4c83c6348173a9bd3f88ac00000000';

    dataProviderMock.fetchTransaction.resolves(rawTransaction);

    const result = await validateLockTransaction(stateTransition);

    expectValidationError(result, InvalidIdentityLockTransactionError);

    const [error] = result.getErrors();

    expect(error.message).to.equal('Invalid identity lock transaction: Output has invalid public key hash');

    expect(parseOutPointBufferMock).to.be.calledOnceWithExactly(lockedOutPointBuffer);
    expect(dataProviderMock.fetchTransaction).to.be.calledOnceWithExactly(transactionHash);
  });

  it('should return invalid result if state transition has wrong signature', async () => {
    stateTransition.signByPrivateKey('17bc80e9cc3d9082925502342acd2e308ab391c45f753f619b05029b4a487d8f');

    const result = await validateLockTransaction(stateTransition);

    expectValidationError(result, InvalidStateTransitionSignatureError);

    const [error] = result.getErrors();

    expect(error.getRawStateTransition()).to.deep.equal(stateTransition);
    expect(parseOutPointBufferMock).to.be.calledOnceWithExactly(lockedOutPointBuffer);
    expect(dataProviderMock.fetchTransaction).to.be.calledOnceWithExactly(transactionHash);
  });
});
