const createAjv = require('../../../../../lib/ajv/createAjv');

const JsonSchemaValidator = require('../../../../../lib/validation/JsonSchemaValidator');

const validateAssetLockStructureFactory = require('../../../../../lib/identity/stateTransitions/assetLock/validateAssetLockStructureFactory');

const getInstantAssetLockFixture = require('../../../../../lib/test/fixtures/getInstantAssetLockProofFixture');
const getChainAssetLockFixture = require('../../../../../lib/test/fixtures/getChainAssetLockProofFixture');

const InvalidIdentityAssetLockTransactionOutputError = require(
  '../../../../../lib/errors/InvalidIdentityAssetLockTransactionOutputError',
);
const InvalidIdentityAssetLockTransactionError = require('../../../../../lib/errors/InvalidIdentityAssetLockTransactionError');
const IdentityAssetLockTransactionOutputNotFoundError = require('../../../../../lib/errors/IdentityAssetLockTransactionOutputNotFoundError');
const { expectValidationError, expectJsonSchemaError } = require(
  '../../../../../lib/test/expect/expectError',
);

const ConsensusError = require('../../../../../lib/errors/ConsensusError');
const ValidationResult = require('../../../../../lib/validation/ValidationResult');

const createStateRepositoryMock = require('../../../../../lib/test/mocks/createStateRepositoryMock');

describe('validateAssetLockStructureFactory', () => {
  let validateAssetLockStructure;
  let instantAssetLock;
  let chainAssetLock;
  let rawAssetLock;
  let proofValidationFunctionMock;
  let stateRepositoryMock;

  beforeEach(function beforeEach() {
    instantAssetLock = getInstantAssetLockFixture();
    chainAssetLock = getChainAssetLockFixture();

    rawAssetLock = instantAssetLock.toObject();

    const jsonSchemaValidator = new JsonSchemaValidator(createAjv());

    proofValidationFunctionMock = this.sinonSandbox.stub();

    const proofValidationFunctionsByType = {
      0: proofValidationFunctionMock,
      1: proofValidationFunctionMock,
    };

    stateRepositoryMock = createStateRepositoryMock(this.sinonSandbox);

    validateAssetLockStructure = validateAssetLockStructureFactory(
      jsonSchemaValidator,
      proofValidationFunctionsByType,
      stateRepositoryMock,
    );
  });

  describe('transaction', () => {
    describe('chain', () => {
      beforeEach(() => {
        rawAssetLock = chainAssetLock.toObject();
        stateRepositoryMock.fetchTransaction.resolves(
          instantAssetLock.proof.transaction.toBuffer(),
        );
      });

      it('should be valid', async () => {
        proofValidationFunctionMock.resolves(
          new ValidationResult(),
        );

        stateRepositoryMock.fetchTransaction.resolves(Buffer.alloc(100, 1));

        const result = await validateAssetLockStructure(rawAssetLock);

        expectValidationError(result, InvalidIdentityAssetLockTransactionError);

        const [error] = result.getErrors();

        expect(error.message).to.equal('Invalid asset lock transaction: Unknown special transaction type');
      });

      it('should point to specific output in transaction', async () => {
        proofValidationFunctionMock.resolves(
          new ValidationResult(),
        );

        const outPoint = {
          outpointHash: '6e200d059fb567ba19e92f5c2dcd3dde522fd4e0a50af223752db16158dabb1d',
          outpointIndex: 42,
        };

        const binaryTransactionHash = Buffer.from(outPoint.outpointHash, 'hex');
        const indexBuffer = Buffer.alloc(4);

        indexBuffer.writeUInt32LE(outPoint.outpointIndex, 0);

        rawAssetLock.proof.outPoint = Buffer.concat([binaryTransactionHash, indexBuffer]);

        const result = await validateAssetLockStructure(rawAssetLock);

        expectValidationError(result, IdentityAssetLockTransactionOutputNotFoundError);

        const [error] = result.getErrors();

        expect(error.getOutputIndex()).to.equal(outPoint.outpointIndex);
      });
    });

    describe('instant', () => {
      it('should be valid', async () => {
        proofValidationFunctionMock.resolves(
          new ValidationResult(),
        );

        rawAssetLock.proof.transaction = Buffer.alloc(100, 1);

        const result = await validateAssetLockStructure(rawAssetLock);

        expectValidationError(result, InvalidIdentityAssetLockTransactionError);

        const [error] = result.getErrors();

        expect(error.message).to.equal('Invalid asset lock transaction: Unknown special transaction type');
      });

      it('should point to specific output in transaction', async () => {
        proofValidationFunctionMock.resolves(
          new ValidationResult(),
        );

        rawAssetLock.proof.outputIndex = 10;

        const result = await validateAssetLockStructure(rawAssetLock);

        expectValidationError(result, IdentityAssetLockTransactionOutputNotFoundError);

        const [error] = result.getErrors();

        expect(error.getOutputIndex()).to.equal(rawAssetLock.proof.outputIndex);
      });
    });

    it('should point to output with OR_RETURN', async () => {
      proofValidationFunctionMock.resolves(
        new ValidationResult(),
      );

      rawAssetLock.proof.outputIndex = 1;

      const result = await validateAssetLockStructure(rawAssetLock);

      expectValidationError(result, InvalidIdentityAssetLockTransactionOutputError);

      const [error] = result.getErrors();

      expect(error.message).to.equal('Invalid asset lock transaction output: Output is not a valid standard OP_RETURN output');
    });

    it('should point to output with public key hash', async () => {
      proofValidationFunctionMock.resolves(
        new ValidationResult(),
      );

      rawAssetLock.proof.outputIndex = 2;

      const result = await validateAssetLockStructure(rawAssetLock);

      expectValidationError(result, InvalidIdentityAssetLockTransactionOutputError);

      const [error] = result.getErrors();

      expect(error.message).to.equal('Invalid asset lock transaction output: Output has invalid public key hash');
    });
  });

  describe('proof', () => {
    it('should be present', async () => {
      delete rawAssetLock.proof;

      const result = await validateAssetLockStructure(rawAssetLock);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('');
      expect(error.keyword).to.equal('required');
      expect(error.params.missingProperty).to.equal('proof');
    });

    it('should be an object', async () => {
      rawAssetLock.proof = 1;

      const result = await validateAssetLockStructure(rawAssetLock);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.proof');
      expect(error.keyword).to.equal('type');
    });

    describe('type', () => {
      it('should be present', async () => {
        delete rawAssetLock.proof.type;

        const result = await validateAssetLockStructure(rawAssetLock);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.proof');
        expect(error.keyword).to.equal('required');
        expect(error.params.missingProperty).to.equal('type');
      });

      it('should be equal to 0', async () => {
        rawAssetLock.proof.type = -1;

        const result = await validateAssetLockStructure(rawAssetLock);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.proof.type');
        expect(error.keyword).to.equal('enum');
      });
    });
  });

  it('should return invalid result if proof is not valid', async () => {
    const proofError = new ConsensusError('something');

    proofValidationFunctionMock.resolves(
      new ValidationResult([proofError]),
    );

    const result = await validateAssetLockStructure(rawAssetLock);

    expectValidationError(result);

    const [error] = result.getErrors();

    expect(error).to.equal(proofError);
  });

  it('should return valid result with public key hash', async () => {
    proofValidationFunctionMock.resolves(
      new ValidationResult(),
    );

    const result = await validateAssetLockStructure(rawAssetLock);

    expect(result).to.be.instanceOf(ValidationResult);
    expect(result.isValid()).to.be.true();

    expect(result.getData()).to.be.instanceOf(Buffer);
    expect(result.getData()).to.have.lengthOf(20);

    expect(proofValidationFunctionMock).to.be.calledOnce();

    const { args } = proofValidationFunctionMock.getCall(0);

    expect(args[0]).to.be.deep.equal(rawAssetLock.proof);
  });
});
