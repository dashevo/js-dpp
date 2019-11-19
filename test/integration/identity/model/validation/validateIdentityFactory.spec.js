const Ajv = require('ajv');

const getIdentityFixture = require('../../../../../lib/test/fixtures/getIdentityFixture');

const JsonSchemaValidator = require(
  '../../../../../lib/validation/JsonSchemaValidator',
);

const { expectValidationError } = require(
  '../../../../../lib/test/expect/expectError',
);

const validateIdentityFactory = require(
  '../../../../../lib/identity/model/validation/validateIdentityFactory',
);

const Identity = require('../../../../../lib/identity/model/Identity');

const JsonSchemaError = require(
  '../../../../../lib/errors/JsonSchemaError',
);

const IncorrectIdentityTypeError = require(
  '../../../../../lib/errors/IncorrectIdentityTypeError',
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

  it('should throw an error if id is not set', () => {
    rawIdentity.id = undefined;

    const result = validateIdentity(rawIdentity);

    expectValidationError(result, JsonSchemaError, 1);

    const [error] = result.getErrors();

    expect(error.message).to.equal('should have required property \'id\'');
    expect(error.keyword).to.equal('required');
  });

  it('should throw an error if type is not set', () => {
    rawIdentity.type = undefined;

    const result = validateIdentity(rawIdentity);

    expectValidationError(result, JsonSchemaError, 1);

    const [error] = result.getErrors();

    expect(error.message).to.equal('should have required property \'type\'');
    expect(error.keyword).to.equal('required');
  });

  it('should throw an error if publicKeys is not set', () => {
    rawIdentity.publicKeys = undefined;

    const result = validateIdentity(rawIdentity);

    expectValidationError(result, JsonSchemaError, 1);

    const [error] = result.getErrors();

    expect(error.message).to.equal('should have required property \'publicKeys\'');
    expect(error.keyword).to.equal('required');
  });

  it('should throw an error if id is less than 42 characters', () => {
    rawIdentity.id = Buffer.alloc(28).toString('base64');

    const result = validateIdentity(rawIdentity);

    expectValidationError(result, JsonSchemaError, 1);

    const [error] = result.getErrors();

    expect(error.keyword).to.equal('minLength');
    expect(error.dataPath).to.equal('.id');
  });

  it('should throw an error if id is more than 44 characters', () => {
    rawIdentity.id = Buffer.alloc(36).toString('base64');

    const result = validateIdentity(rawIdentity);

    expectValidationError(result, JsonSchemaError, 1);

    const [error] = result.getErrors();

    expect(error.keyword).to.equal('maxLength');
    expect(error.dataPath).to.equal('.id');
  });

  it('should throw an error if id is not base64', () => {
    rawIdentity.id = '&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&';

    const result = validateIdentity(rawIdentity);

    expectValidationError(result, JsonSchemaError, 1);

    const [error] = result.getErrors();

    expect(error.keyword).to.equal('pattern');
    expect(error.dataPath).to.equal('.id');
  });

  it('should throw an error if type is not a multiple of 1', () => {
    rawIdentity.type = 1.2;

    const result = validateIdentity(rawIdentity);

    expect(result.isValid()).to.be.false();

    const [error] = result.getErrors();

    expect(error.keyword).to.equal('multipleOf');
    expect(error.dataPath).to.equal('.type');
  });

  it('should throw an error if type is less than 0', () => {
    rawIdentity.type = -1;

    const result = validateIdentity(rawIdentity);

    expect(result.isValid()).to.be.false();

    const [error] = result.getErrors();

    expect(error.keyword).to.equal('minimum');
    expect(error.dataPath).to.equal('.type');
  });

  it('should throw an error if type is more than 65535', () => {
    rawIdentity.type = 77777;

    const result = validateIdentity(rawIdentity);

    expect(result.isValid()).to.be.false();

    const [error] = result.getErrors();

    expect(error.keyword).to.equal('maximum');
    expect(error.dataPath).to.equal('.type');
  });

  it('should throw an error if publicKeys have no keys', () => {
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

  it('should throw an error if type is not known', () => {
    rawIdentity.type = 42;

    const result = validateIdentity(rawIdentity);

    expectValidationError(result, IncorrectIdentityTypeError, 1);

    const [error] = result.getErrors();

    expect(error.getIdentity()).to.deep.equal(rawIdentity);
  });

  it('should pass valid raw identity', () => {
    const result = validateIdentity(rawIdentity);
    expect(result.isValid()).to.be.true();
  });

  it('should pass valid identity', () => {
    const result = validateIdentity(new Identity(rawIdentity));
    expect(result.isValid()).to.be.true();
  });
});
