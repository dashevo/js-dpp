const Ajv = require('ajv');

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
  let identity;
  let validate;

  beforeEach(() => {
    const schemaValidator = new JsonSchemaValidator(new Ajv());

    identity = {
      id: Buffer.alloc(32).toString('base64'),
      identityType: 0,
      publicKeys: [
        {
          id: 1,
          type: 0,
          publicKey: 'I5q3O2KMNSWAYd4eF7fY5g2grOju4fSAoqrqTJ9kEtc=',
          isEnabled: true,
        },
      ],
    };

    validate = validateIdentityFactory(schemaValidator);
  });

  it('should throw an error if id is not set', () => {
    identity.id = undefined;

    const result = validate(identity);

    expectValidationError(result, JsonSchemaError, 1);

    const [error] = result.getErrors();

    expect(error.message).to.equal('should have required property \'id\'');
    expect(error.keyword).to.equal('required');
  });

  it('should throw an error if identityType is not set', () => {
    identity.identityType = undefined;

    const result = validate(identity);

    expectValidationError(result, JsonSchemaError, 1);

    const [error] = result.getErrors();

    expect(error.message).to.equal('should have required property \'identityType\'');
    expect(error.keyword).to.equal('required');
  });

  it('should throw an error if publicKeys is not set', () => {
    identity.publicKeys = undefined;

    const result = validate(identity);

    expectValidationError(result, JsonSchemaError, 1);

    const [error] = result.getErrors();

    expect(error.message).to.equal('should have required property \'publicKeys\'');
    expect(error.keyword).to.equal('required');
  });

  it('should throw an error if id is less than 42 characters', () => {
    identity.id = Buffer.alloc(28).toString('base64');

    const result = validate(identity);

    expectValidationError(result, JsonSchemaError, 1);

    const [error] = result.getErrors();

    expect(error.keyword).to.equal('minLength');
    expect(error.dataPath).to.equal('.id');
  });

  it('should throw an error if id is more than 44 characters', () => {
    identity.id = Buffer.alloc(36).toString('base64');

    const result = validate(identity);

    expectValidationError(result, JsonSchemaError, 1);

    const [error] = result.getErrors();

    expect(error.keyword).to.equal('maxLength');
    expect(error.dataPath).to.equal('.id');
  });

  it('should throw an error if id is not base64', () => {
    identity.id = '&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&';

    const result = validate(identity);

    expectValidationError(result, JsonSchemaError, 1);

    const [error] = result.getErrors();

    expect(error.keyword).to.equal('pattern');
    expect(error.dataPath).to.equal('.id');
  });

  it('should throw an error if identityType is not a multiple of 1', () => {
    identity.identityType = 1.2;

    const result = validate(identity);

    expect(result.isValid()).to.be.false();

    const [error] = result.getErrors();

    expect(error.keyword).to.equal('multipleOf');
    expect(error.dataPath).to.equal('.identityType');
  });

  it('should throw an error if identityType is less than 0', () => {
    identity.identityType = -1;

    const result = validate(identity);

    expect(result.isValid()).to.be.false();

    const [error] = result.getErrors();

    expect(error.keyword).to.equal('minimum');
    expect(error.dataPath).to.equal('.identityType');
  });

  it('should throw an error if identityType is more than 65535', () => {
    identity.identityType = 77777;

    const result = validate(identity);

    expect(result.isValid()).to.be.false();

    const [error] = result.getErrors();

    expect(error.keyword).to.equal('maximum');
    expect(error.dataPath).to.equal('.identityType');
  });

  it('should throw an error if publicKeys have no keys', () => {
    identity.publicKeys = [];

    const result = validate(identity);

    expectValidationError(result, JsonSchemaError, 1);

    const [error] = result.getErrors();

    expect(error.keyword).to.equal('minItems');
    expect(error.dataPath).to.equal('.publicKeys');
  });

  it('should throw an error if publicKeys have more than 100 keys', () => {
    const [key] = identity.publicKeys;

    identity.publicKeys = [];
    for (let i = 0; i < 101; i++) {
      identity.publicKeys.push(key);
    }

    const result = validate(identity);

    expectValidationError(result, JsonSchemaError, 1);

    const [error] = result.getErrors();

    expect(error.keyword).to.equal('maxItems');
    expect(error.dataPath).to.equal('.publicKeys');
  });

  it('should throw an error if type is not known', () => {
    identity.identityType = 42;

    const result = validate(identity);

    expectValidationError(result, IncorrectIdentityTypeError, 1);

    const [error] = result.getErrors();

    expect(error.getIdentity()).to.deep.equal(identity);
  });

  it('should pass valid raw identity', () => {
    const result = validate(identity);
    expect(result.isValid()).to.be.true();
  });

  it('should pass valid identity', () => {
    const result = validate(new Identity(identity));
    expect(result.isValid()).to.be.true();
  });
});
