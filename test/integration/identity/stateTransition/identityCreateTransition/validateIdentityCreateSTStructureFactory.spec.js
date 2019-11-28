const Ajv = require('ajv');

const getIdentityCreateSTFixture = require('../../../../../lib/test/fixtures/getIdentityCreateSTFixture');

const JsonSchemaValidator = require(
  '../../../../../lib/validation/JsonSchemaValidator',
);

const validateIdentityCreateSTStructureFactory = require(
  '../../../../../lib/identity/stateTransitions/identityCreateTransition/validateIdentityCreateSTStructureFactory',
);

const { expectValidationError, expectJsonSchemaError } = require(
  '../../../../../lib/test/expect/expectError',
);

const IdentityCreateTransition = require(
  '../../../../../lib/identity/stateTransitions/identityCreateTransition/IdentityCreateTransition',
);

const ValidationResult = require('../../../../../lib/validation/ValidationResult');

const ConsensusError = require('../../../../../lib/errors/ConsensusError');

describe('validateIdentityCreateSTStructureFactory', () => {
  let validateIdentityCreateST;
  let rawStateTransition;
  let stateTransition;
  let validateIdentityTypeMock;
  let validatePublicKeysMock;

  beforeEach(function beforeEach() {
    const ajv = new Ajv();
    const validator = new JsonSchemaValidator(ajv);

    validateIdentityTypeMock = this.sinonSandbox.stub().returns(new ValidationResult());
    validatePublicKeysMock = this.sinonSandbox.stub().returns(new ValidationResult());

    validateIdentityCreateST = validateIdentityCreateSTStructureFactory(
      validator,
      validateIdentityTypeMock,
      validatePublicKeysMock,
    );

    stateTransition = getIdentityCreateSTFixture();

    rawStateTransition = stateTransition.toJSON();
  });

  describe('lockedOutPoint', () => {
    it('should be present', () => {
      rawStateTransition.lockedOutPoint = undefined;

      const result = validateIdentityCreateST(rawStateTransition);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('');
      expect(error.params.missingProperty).to.equal('lockedOutPoint');
      expect(error.keyword).to.equal('required');

      expect(validateIdentityTypeMock).to.not.be.called();
      expect(validatePublicKeysMock).to.not.be.called();
    });

    it('should not be less than 48 characters in length', () => {
      rawStateTransition.lockedOutPoint = '1';

      const result = validateIdentityCreateST(rawStateTransition);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.keyword).to.equal('minLength');
      expect(error.dataPath).to.equal('.lockedOutPoint');

      expect(validateIdentityTypeMock).to.not.be.called();
      expect(validatePublicKeysMock).to.not.be.called();
    });

    it('should not be more than 48 characters in length', () => {
      rawStateTransition.lockedOutPoint = Buffer.alloc(48).toString('base64');

      const result = validateIdentityCreateST(rawStateTransition);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.keyword).to.equal('maxLength');
      expect(error.dataPath).to.equal('.lockedOutPoint');

      expect(validateIdentityTypeMock).to.not.be.called();
      expect(validatePublicKeysMock).to.not.be.called();
    });

    it('should be base64 encoded', () => {
      rawStateTransition.lockedOutPoint = '&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&';

      const result = validateIdentityCreateST(rawStateTransition);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.keyword).to.equal('pattern');
      expect(error.dataPath).to.equal('.lockedOutPoint');

      expect(validateIdentityTypeMock).to.not.be.called();
      expect(validatePublicKeysMock).to.not.be.called();
    });
  });

  describe('identityType', () => {
    it('should be present', () => {
      rawStateTransition.identityType = undefined;

      const result = validateIdentityCreateST(rawStateTransition);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('');
      expect(error.params.missingProperty).to.equal('.identityType');
      expect(error.keyword).to.equal('required');

      expect(validateIdentityTypeMock).to.not.be.called();
      expect(validatePublicKeysMock).to.not.be.called();
    });

    it('should be an integer', () => {
      rawStateTransition.type = 1.2;

      const result = validateIdentityCreateST(rawStateTransition);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.keyword).to.equal('multipleOf');
      expect(error.dataPath).to.equal('.type');

      expect(validateIdentityTypeMock).to.not.be.called();
      expect(validatePublicKeysMock).to.not.be.called();
    });

    it('should not be less than 0', () => {
      rawStateTransition.type = -1;

      const result = validateIdentityCreateST(rawStateTransition);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.keyword).to.equal('minimum');
      expect(error.dataPath).to.equal('.type');

      expect(validateIdentityTypeMock).to.not.be.called();
      expect(validatePublicKeysMock).to.not.be.called();
    });

    it('should not be more than 65535', () => {
      rawStateTransition.type = 100000;

      const result = validateIdentityCreateST(rawStateTransition);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.keyword).to.equal('maximum');
      expect(error.dataPath).to.equal('.type');

      expect(validateIdentityTypeMock).to.not.be.called();
      expect(validatePublicKeysMock).to.not.be.called();
    });
  });

  describe('publicKeys', () => {
    it('should be present', () => {
      rawStateTransition.publicKeys = undefined;

      const result = validateIdentityCreateST(rawStateTransition);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('');
      expect(error.params.missingProperty).to.equal('publicKeys');
      expect(error.keyword).to.equal('required');

      expect(validateIdentityTypeMock).to.not.be.called();
      expect(validatePublicKeysMock).to.not.be.called();
    });

    it('should not be empty', () => {
      rawStateTransition.publicKeys = [];

      const result = validateIdentityCreateST(rawStateTransition);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.keyword).to.equal('minItems');
      expect(error.dataPath).to.equal('.publicKeys');

      expect(validateIdentityTypeMock).to.not.be.called();
      expect(validatePublicKeysMock).to.not.be.called();
    });

    it('should not have more than 10 items', () => {
      const [key] = rawStateTransition.publicKeys;

      for (let i = 0; i < 10; i++) {
        rawStateTransition.publicKeys.push(key);
      }

      const result = validateIdentityCreateST(rawStateTransition);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.keyword).to.equal('maxItems');
      expect(error.dataPath).to.equal('.publicKeys');

      expect(validateIdentityTypeMock).to.not.be.called();
      expect(validatePublicKeysMock).to.not.be.called();
    });
  });

  it('should return invalid result if there are duplicate keys', () => {
    const consensusError = new ConsensusError('error');

    validateIdentityTypeMock.returns(new ValidationResult([consensusError]));

    const result = validateIdentityCreateST(rawStateTransition);

    expectValidationError(result);

    const [error] = result.getErrors();

    expect(error).to.equal(consensusError);

    expect(validateIdentityTypeMock).to.be.calledOnceWithExactly(rawStateTransition.identityType);
    expect(validatePublicKeysMock).to.be.calledOnceWithExactly(
      rawStateTransition.publicKeys,
    );
  });

  it('should return invalid result if identity type is unknown', () => {
    const consensusError = new ConsensusError('error');

    validatePublicKeysMock.returns(new ValidationResult([consensusError]));

    const result = validateIdentityCreateST(rawStateTransition);

    expectValidationError(result);

    const [error] = result.getErrors();

    expect(error).to.equal(consensusError);

    expect(validateIdentityTypeMock).to.be.calledOnceWithExactly(rawStateTransition.identityType);
    expect(validatePublicKeysMock).to.be.calledOnceWithExactly(
      rawStateTransition.publicKeys,
    );
  });

  it('should pass valid raw state transition', () => {
    const result = validateIdentityCreateST(rawStateTransition);

    expect(result.isValid()).to.be.true();

    expect(validateIdentityTypeMock).to.be.calledOnceWithExactly(rawStateTransition.identityType);
    expect(validatePublicKeysMock).to.be.calledOnceWithExactly(
      rawStateTransition.publicKeys,
    );
  });

  it('should pass valid state transition', () => {
    const result = validateIdentityCreateST(new IdentityCreateTransition(rawStateTransition));

    expect(result.isValid()).to.be.true();

    expect(validateIdentityTypeMock).to.be.calledOnceWithExactly(rawStateTransition.identityType);
    expect(validatePublicKeysMock).to.be.calledOnceWithExactly(
      rawStateTransition.publicKeys,
    );
  });
});
