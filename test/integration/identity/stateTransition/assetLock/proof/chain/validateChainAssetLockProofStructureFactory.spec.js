const createAjv = require('../../../../../../../lib/ajv/createAjv');

const getChainAssetLockFixture = require('../../../../../../../lib/test/fixtures/getChainAssetLockProofFixture');
const JsonSchemaValidator = require('../../../../../../../lib/validation/JsonSchemaValidator');
const createStateRepositoryMock = require('../../../../../../../lib/test/mocks/createStateRepositoryMock');
const InvalidIdentityAssetLockProofHeightError = require('../../../../../../../lib/errors/InvalidIdentityAssetLockProofHeightError');
const InvalidIdentityAssetLockProofOutPointError = require('../../../../../../../lib/errors/InvalidIdentityAssetLockProofOutPointError');

const { expectValidationError, expectJsonSchemaError } = require(
  '../../../../../../../lib/test/expect/expectError',
);

const validateChainAssetLockProofStructureFactory = require('../../../../../../../lib/identity/stateTransitions/assetLock/proof/chain/validateChainAssetLockProofStructureFactory');

const ValidationResult = require('../../../../../../../lib/validation/ValidationResult');

describe('validateChainAssetLockProofStructureFactory', () => {
  let rawProof;
  let stateRepositoryMock;
  let validateChainAssetLockProofStructure;
  let jsonSchemaValidator;

  beforeEach(function beforeEach() {
    const assetLock = getChainAssetLockFixture();

    rawProof = assetLock.getProof()
      .toObject();

    jsonSchemaValidator = new JsonSchemaValidator(createAjv());

    stateRepositoryMock = createStateRepositoryMock(this.sinonSandbox);

    stateRepositoryMock.verifyChainLockHeight.resolves(true);
    stateRepositoryMock.checkAssetLockTransactionOutPointAlreadyUsed.resolves(true);

    validateChainAssetLockProofStructure = validateChainAssetLockProofStructureFactory(
      jsonSchemaValidator,
      stateRepositoryMock,
    );
  });

  describe('type', () => {
    it('should be present', async () => {
      delete rawProof.type;

      const result = await validateChainAssetLockProofStructure(rawProof);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('');
      expect(error.keyword).to.equal('required');
      expect(error.params.missingProperty).to.equal('type');

      expect(stateRepositoryMock.verifyChainLockHeight).to.not.be.called();
      expect(stateRepositoryMock.checkAssetLockTransactionOutPointAlreadyUsed).to.not.be.called();
    });

    it('should be equal to 1', async () => {
      rawProof.type = -1;

      const result = await validateChainAssetLockProofStructure(rawProof);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.type');
      expect(error.keyword).to.equal('const');

      expect(stateRepositoryMock.verifyChainLockHeight).to.not.be.called();
      expect(stateRepositoryMock.checkAssetLockTransactionOutPointAlreadyUsed).to.not.be.called();
    });
  });

  describe('height', () => {
    it('should be preset', async () => {
      delete rawProof.height;

      const result = await validateChainAssetLockProofStructure(rawProof);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('');
      expect(error.keyword).to.equal('required');
      expect(error.params.missingProperty).to.equal('height');

      expect(stateRepositoryMock.verifyChainLockHeight).to.not.be.called();
      expect(stateRepositoryMock.checkAssetLockTransactionOutPointAlreadyUsed).to.not.be.called();
    });

    it('should be an integer', async () => {
      rawProof.height = 1.5;

      const result = await validateChainAssetLockProofStructure(rawProof);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.height');
      expect(error.keyword).to.equal('type');

      expect(stateRepositoryMock.verifyChainLockHeight).to.not.be.called();
      expect(stateRepositoryMock.checkAssetLockTransactionOutPointAlreadyUsed).to.not.be.called();
    });

    it('should be a number', async () => {
      rawProof.height = '42';

      const result = await validateChainAssetLockProofStructure(rawProof);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.height');
      expect(error.keyword).to.equal('type');

      expect(stateRepositoryMock.verifyChainLockHeight).to.not.be.called();
      expect(stateRepositoryMock.checkAssetLockTransactionOutPointAlreadyUsed).to.not.be.called();
    });

    it('should be greater than 0', async () => {
      rawProof.height = 0;

      const result = await validateChainAssetLockProofStructure(rawProof);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.height');
      expect(error.keyword).to.equal('minimum');

      expect(stateRepositoryMock.verifyChainLockHeight).to.not.be.called();
      expect(stateRepositoryMock.checkAssetLockTransactionOutPointAlreadyUsed).to.not.be.called();
    });

    it('should be less than 4294967296', async () => {
      rawProof.height = 4294967296;

      const result = await validateChainAssetLockProofStructure(rawProof);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.height');
      expect(error.keyword).to.equal('maximum');

      expect(stateRepositoryMock.verifyChainLockHeight).to.not.be.called();
      expect(stateRepositoryMock.checkAssetLockTransactionOutPointAlreadyUsed).to.not.be.called();
    });

    it('should be valid', async () => {
      stateRepositoryMock.verifyChainLockHeight.resolves(false);

      const result = await validateChainAssetLockProofStructure(rawProof);

      expectValidationError(result, InvalidIdentityAssetLockProofHeightError);
      const [error] = result.getErrors();

      expect(error.getHeight()).to.equal(rawProof.height);

      expect(stateRepositoryMock.verifyChainLockHeight)
        .to.be.calledOnceWithExactly(rawProof.height);
      expect(stateRepositoryMock.checkAssetLockTransactionOutPointAlreadyUsed).to.not.be.called();
    });
  });

  describe('outPoint', () => {
    it('should be present', async () => {
      delete rawProof.outPoint;

      const result = await validateChainAssetLockProofStructure(rawProof);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('');
      expect(error.keyword).to.equal('required');
      expect(error.params.missingProperty).to.equal('outPoint');

      expect(stateRepositoryMock.verifyChainLockHeight).to.not.be.called();
      expect(stateRepositoryMock.checkAssetLockTransactionOutPointAlreadyUsed).to.not.be.called();
    });

    it('should be a byte array', async () => {
      rawProof.outPoint = new Array(36).fill('string');

      const result = await validateChainAssetLockProofStructure(rawProof);

      expectJsonSchemaError(result, 2);

      const [error, byteArrayError] = result.getErrors();

      expect(error.dataPath).to.equal('.outPoint[0]');
      expect(error.keyword).to.equal('type');

      expect(byteArrayError.keyword).to.equal('byteArray');

      expect(stateRepositoryMock.verifyChainLockHeight).to.not.be.called();
      expect(stateRepositoryMock.checkAssetLockTransactionOutPointAlreadyUsed).to.not.be.called();
    });

    it('should not be shorter than 36 bytes', async () => {
      rawProof.outPoint = Buffer.alloc(35);

      const result = await validateChainAssetLockProofStructure(rawProof);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.outPoint');
      expect(error.keyword).to.equal('minItems');

      expect(stateRepositoryMock.verifyChainLockHeight).to.not.be.called();
      expect(stateRepositoryMock.checkAssetLockTransactionOutPointAlreadyUsed).to.not.be.called();
    });

    it('should not be longer than 36 bytes', async () => {
      rawProof.outPoint = Buffer.alloc(37);

      const result = await validateChainAssetLockProofStructure(rawProof);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.outPoint');
      expect(error.keyword).to.equal('maxItems');

      expect(stateRepositoryMock.verifyChainLockHeight).to.not.be.called();
      expect(stateRepositoryMock.checkAssetLockTransactionOutPointAlreadyUsed).to.not.be.called();
    });

    it('should be valid', async () => {
      stateRepositoryMock.checkAssetLockTransactionOutPointAlreadyUsed.resolves(false);

      const result = await validateChainAssetLockProofStructure(rawProof);

      expectValidationError(result, InvalidIdentityAssetLockProofOutPointError);
      const [error] = result.getErrors();

      expect(error.getOutPoint()).to.deep.equal(rawProof.outPoint);

      expect(stateRepositoryMock.verifyChainLockHeight)
        .to.be.calledOnceWithExactly(rawProof.height);
      expect(stateRepositoryMock.checkAssetLockTransactionOutPointAlreadyUsed)
        .to.be.calledOnceWithExactly(rawProof.outPoint);
    });
  });

  it('should return valid result', async () => {
    const result = await validateChainAssetLockProofStructure(rawProof);

    expect(result).to.be.an.instanceOf(ValidationResult);
    expect(result.isValid()).to.be.true();

    expect(stateRepositoryMock.verifyChainLockHeight)
      .to.be.calledOnceWithExactly(rawProof.height);
    expect(stateRepositoryMock.checkAssetLockTransactionOutPointAlreadyUsed)
      .to.be.calledOnceWithExactly(rawProof.outPoint);
  });
});
