const Ajv = require('ajv');

const JsonSchemaValidator = require(
  '../../../../../../lib/validation/JsonSchemaValidator',
);

const validateIdentityCreateSTStructureFactory = require(
  '../../../../../../lib/identity/stateTransitions/validation/structure/validateIdentityCreateSTStructureFactory',
);

const { expectValidationError } = require(
  '../../../../../../lib/test/expect/expectError',
);

const JsonSchemaError = require(
  '../../../../../../lib/errors/JsonSchemaError',
);

describe('validateIdentityCreateSTStructureFactory', () => {
  let validateIdentityCreateST;
  let rawStateTransition;

  beforeEach(() => {
    const ajv = new Ajv();
    const validator = new JsonSchemaValidator(ajv);

    validateIdentityCreateST = validateIdentityCreateSTStructureFactory(
      validator,
    );

    rawStateTransition = {
      identityCreateStateTransitionVersion: 0,
      lockedOutPoint: Buffer.alloc(36).toString('base64'),
      identityType: 0,
      publicKeys: [
        {
          id: 1,
          type: 1,
          publicKey: Buffer.alloc(240).toString('base64'),
          isEnabled: true,
        },
      ],
      ownershipProofSignature: Buffer.alloc(74).toString('base64'),
    };
  });

  it('should throw an error if identityCreateStateTransitionVersion is not set', () => {
    rawStateTransition.identityCreateStateTransitionVersion = undefined;

    const result = validateIdentityCreateST(rawStateTransition);

    expectValidationError(result, JsonSchemaError, 1);

    const [error] = result.getErrors();

    expect(error.message).to.equal('should have required property \'identityCreateStateTransitionVersion\'');
    expect(error.keyword).to.equal('required');
  });

  it('should throw an error if identityCreateStateTransitionVersion is not a multiple of 1', () => {
    rawStateTransition.identityCreateStateTransitionVersion = 1.2;

    const result = validateIdentityCreateST(rawStateTransition);

    expectValidationError(result, JsonSchemaError, 1);

    const [error] = result.getErrors();

    expect(error.message).to.equal('should be multiple of 1');
    expect(error.keyword).to.equal('multipleOf');
    expect(error.dataPath).to.equal('.identityCreateStateTransitionVersion');
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

    expect(error.message).to.equal('should have required property \'identityType\'');
    expect(error.keyword).to.equal('required');
  });

  it('should throw an error if identityType is not a multiple of 1', () => {
    rawStateTransition.identityType = 1.2;

    const result = validateIdentityCreateST(rawStateTransition);

    expectValidationError(result, JsonSchemaError, 1);

    const [error] = result.getErrors();

    expect(error.keyword).to.equal('multipleOf');
    expect(error.dataPath).to.equal('.identityType');
  });

  it('should throw an error if identityType is less than 0', () => {
    rawStateTransition.identityType = -1;

    const result = validateIdentityCreateST(rawStateTransition);

    expectValidationError(result, JsonSchemaError, 1);

    const [error] = result.getErrors();

    expect(error.keyword).to.equal('minimum');
    expect(error.dataPath).to.equal('.identityType');
  });

  it('should throw an error if identityType is more than 65535', () => {
    rawStateTransition.identityType = 100000;

    const result = validateIdentityCreateST(rawStateTransition);

    expectValidationError(result, JsonSchemaError, 1);

    const [error] = result.getErrors();

    expect(error.keyword).to.equal('maximum');
    expect(error.dataPath).to.equal('.identityType');
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

  it('should throw an error if publicKeys have mote than 10 items', () => {
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

  it('should throw an error if ownershipProofSignature is less than 86 character in length', () => {
    rawStateTransition.ownershipProofSignature = 'AA';

    const result = validateIdentityCreateST(rawStateTransition);

    expectValidationError(result, JsonSchemaError, 1);

    const [error] = result.getErrors();

    expect(error.keyword).to.equal('minLength');
    expect(error.dataPath).to.equal('.ownershipProofSignature');
  });

  it('should throw an error if ownershipProofSignature is more than 87 character in length', () => {
    rawStateTransition.ownershipProofSignature = Buffer.alloc(90).toString('base64');

    const result = validateIdentityCreateST(rawStateTransition);

    expectValidationError(result, JsonSchemaError, 1);

    const [error] = result.getErrors();

    expect(error.keyword).to.equal('maxLength');
    expect(error.dataPath).to.equal('.ownershipProofSignature');
  });

  it('should throw an error if ownershipProofSignature is not base64', () => {
    rawStateTransition.ownershipProofSignature = '&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&';

    const result = validateIdentityCreateST(rawStateTransition);

    expectValidationError(result, JsonSchemaError, 1);

    const [error] = result.getErrors();

    expect(error.keyword).to.equal('pattern');
    expect(error.dataPath).to.equal('.ownershipProofSignature');
  });
});
