const rewiremock = require('rewiremock/node');

const createAjv = require('../../../../../../../lib/ajv/createAjv');

const getAssetLockFixture = require('../../../../../../../lib/test/fixtures/getAssetLockFixture');
const JsonSchemaValidator = require('../../../../../../../lib/validation/JsonSchemaValidator');
const createStateRepositoryMock = require('../../../../../../../lib/test/mocks/createStateRepositoryMock');
const InvalidIdentityAssetLockProofError = require('../../../../../../../lib/errors/InvalidIdentityAssetLockProofError');
const IdentityAssetLockProofMismatchError = require('../../../../../../../lib/errors/IdentityAssetLockProofMismatchError');
const InvalidIdentityAssetLockProofSignatureError = require('../../../../../../../lib/errors/InvalidIdentityAssetLockProofSignatureError');

const { expectValidationError, expectJsonSchemaError } = require(
  '../../../../../../../lib/test/expect/expectError',
);


describe('validateInstantAssetLockProofStructureFactory', () => {
  let rawProof;
  let transaction;
  let stateRepositoryMock;
  let InstantLockClassMock;
  let instantLockMock;
  let validateInstantAssetLockProofStructure;

  beforeEach(function beforeEach() {
    const assetLock = getAssetLockFixture();
    transaction = assetLock.getTransaction();

    rawProof = assetLock.getProof()
      .toObject();

    const jsonSchemaValidator = new JsonSchemaValidator(createAjv());

    stateRepositoryMock = createStateRepositoryMock(this.sinonSandbox);

    instantLockMock = {
      txid: assetLock.getTransaction().id,
      verify: this.sinonSandbox.stub(),
    };

    InstantLockClassMock = {
      fromBuffer: this.sinonSandbox.stub().returns(instantLockMock),
    };

    const validateInstantAssetLockProofStructureFactory = rewiremock.proxy(
      '../../../../../../../lib/identity/stateTransitions/assetLock/proof/instant/validateInstantAssetLockProofStructureFactory',
      {
        '../../../../../../../node_modules/@dashevo/dashcore-lib': {
          InstantLock: InstantLockClassMock,
        },
      },
    );

    validateInstantAssetLockProofStructure = validateInstantAssetLockProofStructureFactory(
      jsonSchemaValidator,
      stateRepositoryMock,
    );
  });

  describe('type', () => {
    it('should be present', async () => {
      delete rawProof.type;

      const result = await validateInstantAssetLockProofStructure(rawProof, transaction);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('');
      expect(error.keyword).to.equal('required');
      expect(error.params.missingProperty).to.equal('type');
    });

    it('should be equal to 0', async () => {
      rawProof.type = -1;

      const result = await validateInstantAssetLockProofStructure(rawProof, transaction);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.type');
      expect(error.keyword).to.equal('const');
    });
  });

  describe('instantLock', () => {
    it('should be present', async () => {
      delete rawProof.instantLock;

      const result = await validateInstantAssetLockProofStructure(rawProof, transaction);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('');
      expect(error.keyword).to.equal('required');
      expect(error.params.missingProperty).to.equal('instantLock');
    });

    it('should be a byte array', async () => {
      rawProof.instantLock = new Array(165).fill('string');

      const result = await validateInstantAssetLockProofStructure(rawProof, transaction);

      expectJsonSchemaError(result, 2);

      const [error, byteArrayError] = result.getErrors();

      expect(error.dataPath).to.equal('.instantLock[0]');
      expect(error.keyword).to.equal('type');

      expect(byteArrayError.keyword).to.equal('byteArray');
    });

    it('should be not shorter than 160 bytes', async () => {
      rawProof.instantLock = Buffer.alloc(159);

      const result = await validateInstantAssetLockProofStructure(rawProof, transaction);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.instantLock');
      expect(error.keyword).to.equal('minItems');
    });

    it('should be not longer than 100 Kb', async () => {
      rawProof.instantLock = Buffer.alloc(100001);

      const result = await validateInstantAssetLockProofStructure(rawProof, transaction);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.instantLock');
      expect(error.keyword).to.equal('maxItems');
    });

    it('should be valid', async () => {
      const instantLockError = new Error('something is wrong');

      InstantLockClassMock.fromBuffer.throws(instantLockError);

      rawProof.instantLock = Buffer.alloc(200);

      const result = await validateInstantAssetLockProofStructure(rawProof, transaction);

      expectValidationError(result, InvalidIdentityAssetLockProofError);

      const [error] = result.getErrors();

      expect(error.message).to.equal(`Invalid asset lock proof: ${instantLockError.message}`);
    });

    it('should lock the same transaction', async () => {
      instantLockMock.txid = '123';

      const result = await validateInstantAssetLockProofStructure(rawProof, transaction);

      expectValidationError(result, IdentityAssetLockProofMismatchError);
    });

    it('should have valid signature', async () => {
      const smlStore = {};

      stateRepositoryMock.fetchSMLStore.resolves(smlStore);

      instantLockMock.verify.resolves(false);

      const result = await validateInstantAssetLockProofStructure(rawProof, transaction);

      expectValidationError(result, InvalidIdentityAssetLockProofSignatureError);

      expect(instantLockMock.verify).to.be.calledOnceWithExactly(smlStore);
    });
  });

  it('should return valid result', async () => {
    const result = await validateInstantAssetLockProofStructure(rawProof, transaction);

    expectValidationError(result, InvalidIdentityAssetLockProofSignatureError);
  });
});
