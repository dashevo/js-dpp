const Ajv = require('ajv');
const bs58 = require('bs58');

const getIdentityFixture = require('../../../../lib/test/fixtures/getIdentityFixture');

const JsonSchemaValidator = require(
  '../../../../lib/validation/JsonSchemaValidator',
);

const { expectValidationError } = require(
  '../../../../lib/test/expect/expectError',
);

const validateIdentityFactory = require(
  '../../../../lib/identity/validation/validateIdentityFactory',
);

const Identity = require('../../../../lib/identity/Identity');

const JsonSchemaError = require(
  '../../../../lib/errors/JsonSchemaError',
);

const IncorrectIdentityTypeError = require(
  '../../../../lib/errors/IncorrectIdentityTypeError',
);

describe('validateIdentityFactory', () => {
  let rawIdentity;
  let validateIdentity;
  let identity;

  beforeEach(() => {
    const schemaValidator = new JsonSchemaValidator(new Ajv());

    identity = getIdentityFixture();

    rawIdentity = identity.toJSON();

    validateIdentity = validateIdentityFactory(schemaValidator);
  });

  describe('id', () => {
    it('should be present', () => {
      rawIdentity.id = undefined;

      const result = validateIdentity(rawIdentity);

      expectValidationError(result, JsonSchemaError, 1);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('');
      expect(error.params.missingProperty).to.equal('id');
      expect(error.keyword).to.equal('required');
    });

    it('should be a string', () => {
      rawIdentity.id = 1;

      const result = validateIdentity(rawIdentity);

      expectValidationError(result, JsonSchemaError, 1);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.id');
      expect(error.keyword).to.equal('type');
    });

    it('should not be less than 32 characters', () => {
      rawIdentity.id = bs58.encode(Buffer.alloc(28));

      const result = validateIdentity(rawIdentity);

      expectValidationError(result, JsonSchemaError, 1);

      const [error] = result.getErrors();

      expect(error.keyword).to.equal('minLength');
      expect(error.dataPath).to.equal('.id');
    });

    it('should not be more than 46 characters', () => {
      rawIdentity.id = bs58.encode(Buffer.alloc(56));

      const result = validateIdentity(rawIdentity);

      expectValidationError(result, JsonSchemaError, 1);

      const [error] = result.getErrors();

      expect(error.keyword).to.equal('maxLength');
      expect(error.dataPath).to.equal('.id');
    });

    it('should be base58 encoded', () => {
      rawIdentity.id = '&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&';

      const result = validateIdentity(rawIdentity);

      expectValidationError(result, JsonSchemaError, 1);

      const [error] = result.getErrors();

      expect(error.keyword).to.equal('pattern');
      expect(error.dataPath).to.equal('.id');
    });
  });

  describe('type', () => {
    it('should be present', () => {
      rawIdentity.type = undefined;

      const result = validateIdentity(rawIdentity);

      expectValidationError(result, JsonSchemaError, 1);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('');
      expect(error.params.missingProperty).to.equal('type');
      expect(error.keyword).to.equal('required');
    });

    it('should be an integer', () => {
      rawIdentity.type = 1.2;

      const result = validateIdentity(rawIdentity);

      expect(result.isValid()).to.be.false();

      const [error] = result.getErrors();

      expect(error.keyword).to.equal('multipleOf');
      expect(error.dataPath).to.equal('.type');
    });

    it('should be greater than 0', () => {
      rawIdentity.type = -1;

      const result = validateIdentity(rawIdentity);

      expect(result.isValid()).to.be.false();

      const [error] = result.getErrors();

      expect(error.keyword).to.equal('minimum');
      expect(error.dataPath).to.equal('.type');
    });

    it('should be less than 65535', () => {
      rawIdentity.type = 77777;

      const result = validateIdentity(rawIdentity);

      expect(result.isValid()).to.be.false();

      const [error] = result.getErrors();

      expect(error.keyword).to.equal('maximum');
      expect(error.dataPath).to.equal('.type');
    });

    it('should return invalid result if type is not known', () => {
      rawIdentity.type = 42;

      const result = validateIdentity(rawIdentity);

      expectValidationError(result, IncorrectIdentityTypeError, 1);

      const [error] = result.getErrors();

      expect(error.getIdentity()).to.deep.equal(rawIdentity);
    });
  });

  describe('publicKeys', () => {
    it('should be present', () => {
      rawIdentity.publicKeys = undefined;

      const result = validateIdentity(rawIdentity);

      expectValidationError(result, JsonSchemaError, 1);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('');
      expect(error.params.missingProperty).to.equal('publicKeys');
      expect(error.keyword).to.equal('required');
    });

    it('should be an array', () => {
      rawIdentity.publicKeys = 1;

      const result = validateIdentity(rawIdentity);

      expectValidationError(result, JsonSchemaError, 1);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.publicKeys');
      expect(error.keyword).to.equal('type');
    });

    it('should not be empty', () => {
      rawIdentity.publicKeys = [];

      const result = validateIdentity(rawIdentity);

      expectValidationError(result, JsonSchemaError, 1);

      const [error] = result.getErrors();

      expect(error.keyword).to.equal('minItems');
      expect(error.dataPath).to.equal('.publicKeys');
    });

    it('should throw an error if publicKeys have more than 100 keys', () => {
      const [key] = rawIdentity.publicKeys;

      rawIdentity.publicKeys = [];
      for (let i = 0; i < 101; i++) {
        rawIdentity.publicKeys.push(key);
      }

      const result = validateIdentity(rawIdentity);

      expectValidationError(result, JsonSchemaError, 1);

      const [error] = result.getErrors();

      expect(error.keyword).to.equal('maxItems');
      expect(error.dataPath).to.equal('.publicKeys');
    });
  });

  it('should return valid result if a raw identity is valid', () => {
    const result = validateIdentity(rawIdentity);

    expect(result.isValid()).to.be.true();
  });

  it('should return valid result if an identity model is valid', () => {
    const result = validateIdentity(new Identity(rawIdentity));

    expect(result.isValid()).to.be.true();
  });
});
