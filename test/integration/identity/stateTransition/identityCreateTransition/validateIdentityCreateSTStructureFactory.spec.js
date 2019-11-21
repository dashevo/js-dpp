const Ajv = require('ajv');

const getIdentityCreateSTFixture = require('../../../../../lib/test/fixtures/getIdentityCreateSTFixture');

const JsonSchemaValidator = require(
  '../../../../../lib/validation/JsonSchemaValidator',
);

const validateIdentityCreateSTStructureFactory = require(
  '../../../../../lib/identity/stateTransitions/identityCreateTransition/validateIdentityCreateSTStructureFactory',
);

const { expectValidationError } = require(
  '../../../../../lib/test/expect/expectError',
);

const JsonSchemaError = require(
  '../../../../../lib/errors/JsonSchemaError',
);

const IdentityCreateTransition = require(
  '../../../../../lib/identity/stateTransitions/identityCreateTransition/IdentityCreateTransition',
);

describe('validateIdentityCreateSTStructureFactory', () => {
  let validateIdentityCreateST;
  let rawStateTransition;
  let stateTransition;

  beforeEach(() => {
    const ajv = new Ajv();
    const validator = new JsonSchemaValidator(ajv);

    validateIdentityCreateST = validateIdentityCreateSTStructureFactory(
      validator,
    );

    stateTransition = getIdentityCreateSTFixture();

    rawStateTransition = stateTransition.toJSON();
  });

  it('should throw an error if lockedOutPoint is not set', () => {
    rawStateTransition.lockedOutPoint = undefined;

    const result = validateIdentityCreateST(rawStateTransition);

    expectValidationError(result, JsonSchemaError, 1);

    const [error] = result.getErrors();

    expect(error.message).to.equal('should have required property \'lockedOutPoint\'');
    expect(error.keyword).to.equal('required');
  });

  it('should throw an error if lockedOutPoint is less than 48 characters in length', () => {
    rawStateTransition.lockedOutPoint = '1';

    const result = validateIdentityCreateST(rawStateTransition);

    expectValidationError(result, JsonSchemaError, 1);

    const [error] = result.getErrors();

    expect(error.keyword).to.equal('minLength');
    expect(error.dataPath).to.equal('.lockedOutPoint');
  });

  it('should throw an error if lockedOutPoint is more than 48 characters in length', () => {
    rawStateTransition.lockedOutPoint = Buffer.alloc(48).toString('base64');

    const result = validateIdentityCreateST(rawStateTransition);

    expectValidationError(result, JsonSchemaError, 1);

    const [error] = result.getErrors();

    expect(error.keyword).to.equal('maxLength');
    expect(error.dataPath).to.equal('.lockedOutPoint');
  });

  it('should throw an error if lockedOutPoint is not base64', () => {
    rawStateTransition.lockedOutPoint = '&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&';

    const result = validateIdentityCreateST(rawStateTransition);

    expectValidationError(result, JsonSchemaError, 1);

    const [error] = result.getErrors();

    expect(error.keyword).to.equal('pattern');
    expect(error.dataPath).to.equal('.lockedOutPoint');
  });

  it('should throw an error if identityType is not set', () => {
    rawStateTransition.identityType = undefined;

    const result = validateIdentityCreateST(rawStateTransition);

    expectValidationError(result, JsonSchemaError, 1);

    const [error] = result.getErrors();

    expect(error.message).to.equal('should have required property \'.identityType\'');
    expect(error.keyword).to.equal('required');
  });

  it('should throw an error if type is not a multiple of 1', () => {
    rawStateTransition.type = 1.2;

    const result = validateIdentityCreateST(rawStateTransition);

    expectValidationError(result, JsonSchemaError, 1);

    const [error] = result.getErrors();

    expect(error.keyword).to.equal('multipleOf');
    expect(error.dataPath).to.equal('.type');
  });

  it('should throw an error if type is less than 0', () => {
    rawStateTransition.type = -1;

    const result = validateIdentityCreateST(rawStateTransition);

    expectValidationError(result, JsonSchemaError, 1);

    const [error] = result.getErrors();

    expect(error.keyword).to.equal('minimum');
    expect(error.dataPath).to.equal('.type');
  });

  it('should throw an error if type is more than 65535', () => {
    rawStateTransition.type = 100000;

    const result = validateIdentityCreateST(rawStateTransition);

    expectValidationError(result, JsonSchemaError, 1);

    const [error] = result.getErrors();

    expect(error.keyword).to.equal('maximum');
    expect(error.dataPath).to.equal('.type');
  });

  it('should throw an error if publicKeys is not set', () => {
    rawStateTransition.publicKeys = undefined;

    const result = validateIdentityCreateST(rawStateTransition);

    expectValidationError(result, JsonSchemaError, 1);

    const [error] = result.getErrors();

    expect(error.message).to.equal('should have required property \'publicKeys\'');
    expect(error.keyword).to.equal('required');
  });

  it('should throw an error if publicKeys have no items', () => {
    rawStateTransition.publicKeys = [];

    const result = validateIdentityCreateST(rawStateTransition);

    expectValidationError(result, JsonSchemaError, 1);

    const [error] = result.getErrors();

    expect(error.keyword).to.equal('minItems');
    expect(error.dataPath).to.equal('.publicKeys');
  });

  it('should throw an error if publicKeys have more than 10 items', () => {
    const [key] = rawStateTransition.publicKeys;

    for (let i = 0; i < 10; i++) {
      rawStateTransition.publicKeys.push(key);
    }

    const result = validateIdentityCreateST(rawStateTransition);

    expectValidationError(result, JsonSchemaError, 1);

    const [error] = result.getErrors();

    expect(error.keyword).to.equal('maxItems');
    expect(error.dataPath).to.equal('.publicKeys');
  });

  it('should throw an error if ownershipProofSignature is not set', () => {
    rawStateTransition.ownershipProofSignature = undefined;

    const result = validateIdentityCreateST(rawStateTransition);

    expectValidationError(result, JsonSchemaError, 1);

    const [error] = result.getErrors();

    expect(error.message).to.equal('should have required property \'ownershipProofSignature\'');
    expect(error.keyword).to.equal('required');
  });

  it('should throw an error if ownershipProofSignature is less than 88 character in length', () => {
    rawStateTransition.ownershipProofSignature = 'AA';

    const result = validateIdentityCreateST(rawStateTransition);

    expectValidationError(result, JsonSchemaError, 1);

    const [error] = result.getErrors();

    expect(error.keyword).to.equal('minLength');
    expect(error.dataPath).to.equal('.ownershipProofSignature');
  });

  it('should throw an error if ownershipProofSignature is more than 88 character in length', () => {
    rawStateTransition.ownershipProofSignature = Buffer.alloc(90).toString('base64');

    const result = validateIdentityCreateST(rawStateTransition);

    expectValidationError(result, JsonSchemaError, 1);

    const [error] = result.getErrors();

    expect(error.keyword).to.equal('maxLength');
    expect(error.dataPath).to.equal('.ownershipProofSignature');
  });

  it('should throw an error if ownershipProofSignature is not base64', () => {
    rawStateTransition.ownershipProofSignature = '&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&';

    const result = validateIdentityCreateST(rawStateTransition);

    expectValidationError(result, JsonSchemaError, 1);

    const [error] = result.getErrors();

    expect(error.keyword).to.equal('pattern');
    expect(error.dataPath).to.equal('.ownershipProofSignature');
  });

  it('should pass valid raw state transition', () => {
    const result = validateIdentityCreateST(rawStateTransition);

    expect(result.isValid()).to.be.true();
  });

  it('should pass valid state transition', () => {
    const result = validateIdentityCreateST(new IdentityCreateTransition(rawStateTransition));

    expect(result.isValid()).to.be.true();
  });
});
