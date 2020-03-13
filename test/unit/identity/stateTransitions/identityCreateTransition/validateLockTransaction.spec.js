const validateLockTransaction = require('../../../../../lib/identity/stateTransitions/identityCreateTransition/validateLockTransaction');

const InvalidIdentityLockTransaction = require('../../../../../lib/errors/InvalidIdentityLockTransaction');

describe('validateLockTransaction', () => {
  let transactionMock;
  let outputIndex;
  let script;

  beforeEach(function beforeEach() {
    script = {
      getData: this.sinonSandbox.stub().returns('a'.repeat(20)),
      isDataOut: this.sinonSandbox.stub().returns(true),
    };

    const output = {
      script,
    };

    outputIndex = 0;
    transactionMock = {
      outputs: [output],
    };
  });

  it('should return valid result', async () => {
    const result = validateLockTransaction(transactionMock, outputIndex);

    expect(result.isValid()).to.be.true();
  });

  it('should return InvalidIdentityLockTransaction error if transaction has no output with given index', async () => {
    outputIndex = 1;
    const result = validateLockTransaction(transactionMock, outputIndex);

    const [error] = result.getErrors();
    expect(error).to.be.an.instanceOf(InvalidIdentityLockTransaction);
    expect(error.getTransaction()).to.deep.equal(transactionMock);
  });

  it('should return InvalidIdentityLockTransaction error if transaction output is not a valid OP_RETURN output', async () => {
    script.isDataOut.returns(false);
    const result = validateLockTransaction(transactionMock, outputIndex);

    const [error] = result.getErrors();
    expect(error).to.be.an.instanceOf(InvalidIdentityLockTransaction);
    expect(error.getTransaction()).to.deep.equal(transactionMock);
  });

  it('should return InvalidIdentityLockTransaction error if transaction output script data has size < 20', async () => {
    script.getData.returns('a');

    const result = validateLockTransaction(transactionMock, outputIndex);

    const [error] = result.getErrors();
    expect(error).to.be.an.instanceOf(InvalidIdentityLockTransaction);
    expect(error.getTransaction()).to.deep.equal(transactionMock);
  });

  it('should return InvalidIdentityLockTransaction error if transaction output script data has size > 20', async () => {
    script.getData.returns('a'.repeat(21));

    const result = validateLockTransaction(transactionMock, outputIndex);

    const [error] = result.getErrors();
    expect(error).to.be.an.instanceOf(InvalidIdentityLockTransaction);
    expect(error.getTransaction()).to.deep.equal(transactionMock);
  });
});
