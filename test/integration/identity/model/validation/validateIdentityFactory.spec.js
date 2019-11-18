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

  it('should pass valid identity', () => {
    const result = validate(identity);
    expect(result.isValid()).to.be.true();
  });
});
