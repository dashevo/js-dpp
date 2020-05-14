const { Transaction } = require('@dashevo/dashcore-lib');
const validateLockTransactionFactory = require('../../../../../lib/identity/stateTransitions/identityCreateTransition/validateLockTransactionFactory');
const IdentityCreateTransition = require('../../../../../lib/identity/stateTransitions/identityCreateTransition/IdentityCreateTransition');
const stateTransitionTypes = require('../../../../../lib/stateTransition/stateTransitionTypes');
const createStateRepositoryMock = require('../../../../../lib/test/mocks/createStateRepositoryMock');

const InvalidIdentityLockTransactionOutputError = require(
  '../../../../../lib/errors/InvalidIdentityLockTransactionOutputError',
);
const IdentityLockTransactionIsNotFinalizedError = require(
  '../../../../../lib/errors/IdentityLockTransactionIsNotFinalizedError',
);
const InvalidStateTransitionSignatureError = require(
  '../../../../../lib/errors/InvalidStateTransitionSignatureError',
);
const { expectValidationError } = require(
  '../../../../../lib/test/expect/expectError',
);

const getVerboseRawTransactionFixture = require(
  '../../../../../lib/test/fixtures/getVerboseRawTransactionFixture',
);

describe('validateLockTransactionFactory', () => {
  let validateLockTransaction;
  let stateTransition;
  let privateKey;
  let parseTransactionOutPointBufferMock;
  let useLockTxFallback;
  let rawTransaction;
  let transactionHash;
  let outputIndex;
  let stateRepositoryMock;
  let lockedOutPoint;

  beforeEach(function beforeEach() {
    useLockTxFallback = false;
    transactionHash = 'f1c1cbc37b5d5543eeb126a53de7863ea2b9d5dbd03b981337bbda76cc6d771c';
    outputIndex = 0;
    lockedOutPoint = 'azW1UgBiB0CmdphN6of4DbT91t0Xv3/c3YUV4CnoV/kAAAAA';

    privateKey = 'af432c476f65211f45f48f1d42c9c0b497e56696aa1736b40544ef1a496af837';

    stateTransition = new IdentityCreateTransition({
      protocolVersion: 0,
      type: stateTransitionTypes.IDENTITY_CREATE,
      lockedOutPoint,
      publicKeys: [
        {
          id: 0,
          type: 1,
          data: 'Alw8x/v8UvcQyUFJf9AYdsGJFx6iJ0WPUBr8s4opfWW0',
          isEnabled: true,
        },
      ],
    });
    stateTransition.signByPrivateKey(privateKey);

    rawTransaction = getVerboseRawTransactionFixture();
    rawTransaction.hex = '030000000137feb5676d0851337ea3c9a992496aab7a0b3eee60aeeb9774000b7f4bababa5000000006b483045022100d91557de37645c641b948c6cd03b4ae3791a63a650db3e2fee1dcf5185d1b10402200e8bd410bf516ca61715867666d31e44495428ce5c1090bf2294a829ebcfa4ef0121025c3cc7fbfc52f710c941497fd01876c189171ea227458f501afcb38a297d65b4ffffffff021027000000000000166a14152073ca2300a86b510fa2f123d3ea7da3af68dcf77cb0090a0000001976a914152073ca2300a86b510fa2f123d3ea7da3af68dc88ac00000000';

    stateRepositoryMock = createStateRepositoryMock(this.sinonSandbox);
    stateRepositoryMock.fetchTransaction.resolves(rawTransaction);

    parseTransactionOutPointBufferMock = this.sinonSandbox.stub().returns({
      transactionHash,
      outputIndex,
    });

    validateLockTransaction = validateLockTransactionFactory(
      stateRepositoryMock,
      parseTransactionOutPointBufferMock,
      useLockTxFallback,
    );
  });

  it('should return valid result', async () => {
    const result = await validateLockTransaction(stateTransition);

    expect(result.isValid()).to.be.true();

    expect(parseTransactionOutPointBufferMock).to.be.calledOnceWithExactly(
      Buffer.from(lockedOutPoint, 'base64'),
    );
    expect(stateRepositoryMock.fetchTransaction).to.be.calledOnceWithExactly(
      transactionHash,
      true,
    );
  });

  it('should check transaction output is a valid OP_RETURN output', async () => {
    rawTransaction.hex = '020000000560c7777e41f9e6da829896aba3d1032f430429ba9e866f230f331cf9f50e8c3b010000006b483045022100cab5638d1498930dcc88047ba0c44b952988c390cd66e643de7b975b62170be40220181ede94c41ded6d83b586ce90e195ed09ad4c6b9dfcb76bc07fbba7b5e89e51012103a65caff6ca4c0415a3ac182dfc2a6d3a4dceb98e8b831e71501df38aa156f2c1feffffff464585394ddc5fffe5b6c34f5592f55aee321cec171b6079ed5eb535bf9ea78b000000006b483045022100ecda52ffb4500b7e593bf6a1d1f7a5b7303acf3a20b58c1cb0200b34a523d1d902203295bfb668e69b79275ed03335a8652d7687012227ac492a12cf9d29c1f7a7cc012103a65caff6ca4c0415a3ac182dfc2a6d3a4dceb98e8b831e71501df38aa156f2c1feffffff42b03f0bfcaa231fb22c0ba1de153976aab7d629f8bde69557b8f429fc2a199b000000006b483045022100ddb49494296712b6f2db5031512d11dd470d338af010088fec65ed398cec0afe0220285d4b7d8a2b3ea0a18fa9d6fe375b401e8f6ae98281a1c3f1a9bd3742840702012103a65caff6ca4c0415a3ac182dfc2a6d3a4dceb98e8b831e71501df38aa156f2c1feffffffbe47c01c96a681c330e584d14432fbe937429b4e9f023d48de35cddafb71b4f5000000006b483045022100ccf54a31a262e5ed9e58e1fa6c23938b81fd79dd62a1057f841e255a64a0e06c0220138773e3f5dd77b0bc1d1f1d01110b1b93741f631c177e7936c335dbaa19686f012103a65caff6ca4c0415a3ac182dfc2a6d3a4dceb98e8b831e71501df38aa156f2c1feffffffb7cfa89729a98884b277d399dc58aaa25bec5e821fd459aad2ae3098df5937fa000000006a47304402200b035f016087a5468cd27f9575fb496aaeaf2c454c8bb402c3624c20bdd4448f022015a23433ad620ea7c5ff92a8198262c66a20595902ddc4141722396ecadc07ca012102a1dc26a61b5ed6fbecd4c0fe65b7dd8c637eee7cfce759cd0c55f83b6d9680b9feffffff02f4c33715000000001976a914ad56adfd39caf20673de73b9eae51352e730a2f288ac7073ac30030000001976a914b9e06afc1400f95eaffce11e51e58b0a8390e88b88ac3f870000';

    const output = new Transaction(rawTransaction.hex).outputs[outputIndex];
    // set internal properties to make instances equal
    output.script.isDataOut();

    const result = await validateLockTransaction(stateTransition);

    expectValidationError(result, InvalidIdentityLockTransactionOutputError);

    const [error] = result.getErrors();

    expect(error.getOutput()).to.deep.equal(output);
  });

  it('should return invalid result if transaction output script data has size < 20', async () => {
    rawTransaction.hex = '0300000001b0315e76d1ce25025171de96490be62835b4262e3bf9d65df80a2f70bc86f0f5000000006b483045022100b09277c39cc1df62103b4f839ae5f1236d6e37714cb22eae122356b2a709c8270220727fc0d9766497c5a15e5fe2f75c93b35bfc1250304d615b81dcb0c6e5f22bda01210365a3f23a40599929c575d73a086990f4b0a3072becfc9f1fe1e27f68c863dc8effffffff030000000000000000156a133131313131313131313131313131313131313110270000000000001976a914b3b3b3c940f30a989cdb0ec806e3418cdaf3e31388ac544a3ba40b0000001976a91412e23d8b8a11d55de380cd40f52c92cba9879abb88ac00000000';

    const result = await validateLockTransaction(stateTransition);

    expectValidationError(result, InvalidIdentityLockTransactionOutputError);

    const [error] = result.getErrors();

    expect(error.message).to.equal('Invalid identity lock transaction output: Output has invalid public key hash');
  });

  it('should return invalid result if transaction output script data has size > 20', async () => {
    rawTransaction.hex = '0300000001ab9e0acbf5384e49eb72f775a0d4196b70dbdd554000145e448f34b45616b852000000006b483045022100d7637538c2fbb5fceb1b1d5e145d49f4cdc9ee906f8cd826eaf686880537e27c02201fdda2d8904ae3247388e716f4f97afba3d7439576b9acafb5431b5d38a0edc60121037582e2aa98ff690a9005839923194315f860eba1eac488a76ee14657d7c03be5ffffffff030000000000000000176a1531313131313131313131313131313131313131313110270000000000001976a914ab85c05d884d197007bbefe88cf732dfe3e0856388ac799d5bcf0a0000001976a91439cd5dd80c5d8e40a13a583f7705e0c690deebf988ac00000000';

    const result = await validateLockTransaction(stateTransition);

    expectValidationError(result, InvalidIdentityLockTransactionOutputError);

    const [error] = result.getErrors();

    expect(error.message).to.equal('Invalid identity lock transaction output: Output has invalid public key hash');
  });

  it('should return invalid result if state transition has wrong signature', async () => {
    stateTransition.signByPrivateKey('17bc80e9cc3d9082925502342acd2e308ab391c45f753f619b05029b4a487d8f');

    const result = await validateLockTransaction(stateTransition);

    expectValidationError(result, InvalidStateTransitionSignatureError);

    const [error] = result.getErrors();

    expect(error.getRawStateTransition()).to.deep.equal(stateTransition);
  });

  it('should return invalid result if transaction is not chainlocked and not instantlocked', async () => {
    rawTransaction.chainlock = false;
    rawTransaction.instantlock = false;

    const result = await validateLockTransaction(stateTransition);

    expectValidationError(result, IdentityLockTransactionIsNotFinalizedError);

    const [error] = result.getErrors();

    expect(error.getTransactionHash()).to.deep.equal(transactionHash);
  });

  it('should return valid result if transaction is only chainlocked', async () => {
    rawTransaction.instantlock = false;

    const result = await validateLockTransaction(stateTransition);

    expect(result.isValid()).to.be.true();

    expect(parseTransactionOutPointBufferMock).to.be.calledOnceWithExactly(
      Buffer.from(lockedOutPoint, 'base64'),
    );
    expect(stateRepositoryMock.fetchTransaction).to.be.calledOnceWithExactly(
      transactionHash,
      true,
    );
  });

  it('should return valid result if transaction is only instantlocked', async () => {
    rawTransaction.chainlock = false;

    const result = await validateLockTransaction(stateTransition);

    expect(result.isValid()).to.be.true();

    expect(parseTransactionOutPointBufferMock).to.be.calledOnceWithExactly(
      Buffer.from(lockedOutPoint, 'base64'),
    );
    expect(stateRepositoryMock.fetchTransaction).to.be.calledOnceWithExactly(
      transactionHash,
      true,
    );
  });

  it('should return valid result on fallback', async () => {
    useLockTxFallback = true;
    rawTransaction.confirmations = 1;
    rawTransaction.chainlock = false;
    rawTransaction.instantlock = false;

    validateLockTransaction = validateLockTransactionFactory(
      stateRepositoryMock,
      parseTransactionOutPointBufferMock,
      useLockTxFallback,
    );

    const result = await validateLockTransaction(stateTransition);

    expect(result.isValid()).to.be.true();

    expect(parseTransactionOutPointBufferMock).to.be.calledOnceWithExactly(
      Buffer.from(lockedOutPoint, 'base64'),
    );
    expect(stateRepositoryMock.fetchTransaction).to.be.calledOnceWithExactly(
      transactionHash,
      true,
    );
  });

  it('should return invalid result on fallback and zero confirmations', async () => {
    useLockTxFallback = true;
    rawTransaction.confirmations = 0;
    rawTransaction.chainlock = false;
    rawTransaction.instantlock = false;

    validateLockTransaction = validateLockTransactionFactory(
      stateRepositoryMock,
      parseTransactionOutPointBufferMock,
      useLockTxFallback,
    );

    const result = await validateLockTransaction(stateTransition);

    expectValidationError(result, IdentityLockTransactionIsNotFinalizedError);

    const [error] = result.getErrors();

    expect(error.getTransactionHash()).to.deep.equal(transactionHash);
  });
});
