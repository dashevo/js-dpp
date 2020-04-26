const Ajv = require('ajv');

const getIdentityCreateSTFixture = require('../../../../../lib/test/fixtures/getIdentityCreateSTFixture');

const validateIdentityCreateSTStructureFactory = require(
  '../../../../../lib/identity/stateTransitions/identityCreateTransition/validateIdentityCreateSTStructureFactory',
);

const JsonSchemaValidator = require(
  '../../../../../lib/validation/JsonSchemaValidator',
);

const IdentityCreateTransition = require(
  '../../../../../lib/identity/stateTransitions/identityCreateTransition/IdentityCreateTransition',
);

const { expectJsonSchemaError } = require('../../../../../lib/test/expect/expectError');

const ValidationResult = require('../../../../../lib/validation/ValidationResult');

describe('validateIdentityCreateSTStructureFactory', () => {
  let validateIdentityCreateST;
  let rawStateTransition;
  let stateTransition;
  let validatePublicKeysMock;

  beforeEach(function beforeEach() {
    const ajv = new Ajv();
    const validator = new JsonSchemaValidator(ajv);

    validatePublicKeysMock = this.sinonSandbox.stub().returns(new ValidationResult());

    validateIdentityCreateST = validateIdentityCreateSTStructureFactory(
      validator,
      validatePublicKeysMock,
    );

    stateTransition = getIdentityCreateSTFixture();

    rawStateTransition = stateTransition.toJSON();
  });

  it('should pass valid raw state transition', () => {
    const result = validateIdentityCreateST(rawStateTransition);

    expect(result.isValid()).to.be.true();

    expect(validatePublicKeysMock).to.be.calledOnceWithExactly(
      rawStateTransition.publicKeys,
    );
  });

  it('should pass valid state transition', () => {
    const result = validateIdentityCreateST(new IdentityCreateTransition(rawStateTransition));

    expect(result.isValid()).to.be.true();

    expect(validatePublicKeysMock).to.be.calledOnceWithExactly(
      rawStateTransition.publicKeys,
    );
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

      expect(validatePublicKeysMock).to.not.be.called();
    });

    it('should not be empty', () => {
      rawStateTransition.publicKeys = [];

      const result = validateIdentityCreateST(rawStateTransition);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.keyword).to.equal('minItems');
      expect(error.dataPath).to.equal('.publicKeys');

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

      expect(validatePublicKeysMock).to.not.be.called();
    });
  });
});
