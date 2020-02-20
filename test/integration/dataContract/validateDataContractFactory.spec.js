const Ajv = require('ajv');
const $RefParser = require('json-schema-ref-parser');

const JsonSchemaValidator = require('../../../lib/validation/JsonSchemaValidator');

const ValidationResult = require('../../../lib/validation/ValidationResult');

const validateDataContractFactory = require('../../../lib/dataContract/validateDataContractFactory');
const validateDataContractMaxDepthFactory = require('../../../lib/dataContract/stateTransition/validation/validateDataContractMaxDepthFactory');

const getDataContractFixture = require('../../../lib/test/fixtures/getDataContractFixture');

const { expectJsonSchemaError, expectValidationError } = require('../../../lib/test/expect/expectError');

const DuplicateIndexError = require('../../../lib/errors/DuplicateIndexError');
const UndefinedIndexPropertyError = require('../../../lib/errors/UndefinedIndexPropertyError');
const InvalidIndexPropertyTypeError = require('../../../lib/errors/InvalidIndexPropertyTypeError');
const SystemPropertyIndexAlreadyPresentError = require('../../../lib/errors/SystemPropertyIndexAlreadyPresentError');
const UniqueIndicesLimitReached = require('../../../lib/errors/UniqueIndicesLimitReached');

const originalEnv = { ...process.env };

describe('validateDataContractFactory', () => {
  let rawDataContract;
  let validateDataContract;
  let allowedIdentities;

  beforeEach(() => {
    rawDataContract = getDataContractFixture().toJSON();

    const ajv = new Ajv();
    const jsonSchemaValidator = new JsonSchemaValidator(ajv);

    const validateDataContractMaxDepth = validateDataContractMaxDepthFactory($RefParser);

    allowedIdentities = ['1'.repeat(42), '2'.repeat(42)].join(',');
    process.env = { ...originalEnv };

    validateDataContract = validateDataContractFactory(
      jsonSchemaValidator,
      validateDataContractMaxDepth,
    );
  });

  describe('$schema', () => {
    it('should be present', async () => {
      delete rawDataContract.$schema;

      const result = await validateDataContract(rawDataContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('');
      expect(error.keyword).to.equal('required');
      expect(error.params.missingProperty).to.equal('$schema');
    });

    it('should be a string', async () => {
      rawDataContract.$schema = 1;

      const result = await validateDataContract(rawDataContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.$schema');
      expect(error.keyword).to.equal('type');
    });

    it('should be a particular url', async () => {
      rawDataContract.$schema = 'wrong';

      const result = await validateDataContract(rawDataContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.keyword).to.equal('const');
      expect(error.dataPath).to.equal('.$schema');
    });
  });

  describe('contractId', () => {
    it('should be present', async () => {
      delete rawDataContract.contractId;

      const result = await validateDataContract(rawDataContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('');
      expect(error.keyword).to.equal('required');
      expect(error.params.missingProperty).to.equal('contractId');
    });

    it('should be a string', async () => {
      rawDataContract.contractId = 1;

      const result = await validateDataContract(rawDataContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.contractId');
      expect(error.keyword).to.equal('type');
    });

    it('should be no less than 42 chars', async () => {
      rawDataContract.contractId = '1'.repeat(41);

      const result = await validateDataContract(rawDataContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.contractId');
      expect(error.keyword).to.equal('minLength');
    });

    it('should be no longer than 44 chars', async () => {
      rawDataContract.contractId = '1'.repeat(45);

      const result = await validateDataContract(rawDataContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.contractId');
      expect(error.keyword).to.equal('maxLength');
    });

    it('should be base58 encoded', async () => {
      rawDataContract.contractId = '&'.repeat(44);

      const result = await validateDataContract(rawDataContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.keyword).to.equal('pattern');
      expect(error.dataPath).to.equal('.contractId');
    });

    it('should be valid if contractId is in the list of allowed identities', async () => {
      process.env.ALLOWED_IDENTITIES = allowedIdentities;

      rawDataContract.contractId = '1'.repeat(42);

      const result = await validateDataContract(rawDataContract);

      expect(result.isValid()).to.be.true();
    });

    it('should not be valid if contractId is not in the list of allowed identities', async () => {
      process.env.ALLOWED_IDENTITIES = allowedIdentities;

      rawDataContract.contractId = '3'.repeat(42);

      const result = await validateDataContract(rawDataContract);

      const [error] = result.getErrors();

      expect(error.name).to.equal('DataContractRestrictedIdentityError');
      expect(error.message).to.equal('The identity is not allowed to register contracts');
      expect(error.getDataContract()).to.be.deep.equal(rawDataContract);
    });
  });

  describe('version', () => {
    it('should be present', async () => {
      delete rawDataContract.version;

      const result = await validateDataContract(rawDataContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('');
      expect(error.keyword).to.equal('required');
      expect(error.params.missingProperty).to.equal('version');
    });

    it('should be a number', async () => {
      rawDataContract.version = 'wrong';

      const result = await validateDataContract(rawDataContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.version');
      expect(error.keyword).to.equal('type');
    });

    it('should be an integer', async () => {
      rawDataContract.version = 1.2;

      const result = await validateDataContract(rawDataContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.version');
      expect(error.keyword).to.equal('multipleOf');
    });

    it('should be greater or equal to one', async () => {
      rawDataContract.version = 0;

      const result = await validateDataContract(rawDataContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.version');
      expect(error.keyword).to.equal('minimum');
    });
  });

  describe('definitions', () => {
    it('may not be present', async () => {
      delete rawDataContract.definitions;
      delete rawDataContract.documents.prettyDocument;

      const result = await validateDataContract(rawDataContract);

      expect(result).to.be.an.instanceOf(ValidationResult);
      expect(result.isValid()).to.be.true();
    });

    it('should be an object', async () => {
      rawDataContract.definitions = 1;

      const result = await validateDataContract(rawDataContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.definitions');
      expect(error.keyword).to.equal('type');
    });

    it('should not be empty', async () => {
      rawDataContract.definitions = {};

      const result = await validateDataContract(rawDataContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.definitions');
      expect(error.keyword).to.equal('minProperties');
    });

    it('should have no non-alphanumeric properties', async () => {
      rawDataContract.definitions = {
        $subSchema: {},
      };

      const result = await validateDataContract(rawDataContract);

      expectJsonSchemaError(result, 2);

      const [patternError, propertyNamesError] = result.getErrors();

      expect(patternError.dataPath).to.equal('.definitions');
      expect(patternError.keyword).to.equal('pattern');

      expect(propertyNamesError.dataPath).to.equal('.definitions');
      expect(propertyNamesError.keyword).to.equal('propertyNames');
    });

    it('should have no more than 100 properties', async () => {
      rawDataContract.definitions = {};

      Array(101).fill({ type: 'string' }).forEach((item, i) => {
        rawDataContract.definitions[i] = item;
      });

      const result = await validateDataContract(rawDataContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.definitions');
      expect(error.keyword).to.equal('maxProperties');
    });

    it('should have valid property names', async () => {
      const validNames = ['validName', 'valid_name', 'valid-name', 'abc', '123abc', 'abc123', 'ValidName',
        'abcdefghigklmnopqrstuvwxyz01234567890abcdefghigklmnopqrstuvwxyz', 'abc_gbf_gdb', 'abc-gbf-gdb'];

      await Promise.all(
        validNames.map(async (name) => {
          rawDataContract.definitions[name] = {
            type: 'string',
          };

          const result = await validateDataContract(rawDataContract);

          expectJsonSchemaError(result, 0);
        }),
      );
    });

    it('should return an invalid result if a property has invalid format', async () => {
      const invalidNames = ['-invalidname', '_invalidname', 'invalidname-', 'invalidname_', '*(*&^', '$test'];

      await Promise.all(
        invalidNames.map(async (name) => {
          rawDataContract.definitions[name] = {
            type: 'string',
          };

          const result = await validateDataContract(rawDataContract);

          expectJsonSchemaError(result, 2);

          const [error] = result.getErrors();

          expect(error.dataPath).to.equal('.definitions');
          expect(error.keyword).to.equal('pattern');
        }),
      );
    });
  });

  describe('documents', () => {
    it('should be present', async () => {
      delete rawDataContract.documents;

      const result = await validateDataContract(rawDataContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('');
      expect(error.keyword).to.equal('required');
      expect(error.params.missingProperty).to.equal('documents');
    });

    it('should be an object', async () => {
      rawDataContract.documents = 1;

      const result = await validateDataContract(rawDataContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.documents');
      expect(error.keyword).to.equal('type');
    });

    it('should not be empty', async () => {
      rawDataContract.documents = {};

      const result = await validateDataContract(rawDataContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.documents');
      expect(error.keyword).to.equal('minProperties');
    });

    it('should have valid property names (document types)', async () => {
      const validNames = ['validName', 'valid_name', 'valid-name', 'abc', '123abc', 'abc123', 'ValidName', 'validName',
        'abcdefghigklmnopqrstuvwxyz01234567890abcdefghigklmnopqrstuvwxyz', 'abc_gbf_gdb', 'abc-gbf-gdb'];

      await Promise.all(
        validNames.map(async (name) => {
          rawDataContract.documents[name] = rawDataContract.documents.niceDocument;

          const result = await validateDataContract(rawDataContract);

          expectJsonSchemaError(result, 0);
        }),
      );
    });

    it('should return an invalid result if a property (document type) has invalid format', async () => {
      const invalidNames = ['-invalidname', '_invalidname', 'invalidname-', 'invalidname_', '*(*&^', '$test'];

      await Promise.all(
        invalidNames.map(async (name) => {
          rawDataContract.documents[name] = rawDataContract.documents.niceDocument;

          const result = await validateDataContract(rawDataContract);

          expectJsonSchemaError(result, 2);

          const [error] = result.getErrors();

          expect(error.dataPath).to.equal('.documents');
          expect(error.keyword).to.equal('pattern');
        }),
      );
    });

    it('should have no more than 100 properties', async () => {
      const niceDocumentDefinition = rawDataContract.documents.niceDocument;

      rawDataContract.documents = {};

      Array(101).fill(niceDocumentDefinition).forEach((item, i) => {
        rawDataContract.documents[i] = item;
      });

      const result = await validateDataContract(rawDataContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.documents');
      expect(error.keyword).to.equal('maxProperties');
    });

    describe('Document schema', () => {
      it('should not be empty', async () => {
        rawDataContract.documents.niceDocument.properties = {};

        const result = await validateDataContract(rawDataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.documents[\'niceDocument\'].properties');
        expect(error.keyword).to.equal('minProperties');
      });

      it('should have type "object"', async () => {
        rawDataContract.documents.niceDocument.type = 'string';

        const result = await validateDataContract(rawDataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.documents[\'niceDocument\'].type');
        expect(error.keyword).to.equal('const');
      });

      it('should have "properties"', async () => {
        delete rawDataContract.documents.niceDocument.properties;

        const result = await validateDataContract(rawDataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.documents[\'niceDocument\']');
        expect(error.keyword).to.equal('required');
        expect(error.params.missingProperty).to.equal('.properties');
      });

      it('should have nested "properties"', async () => {
        rawDataContract.documents.niceDocument.properties.object = {
          type: 'array',
          items: [
            {
              properties: {
                something: {
                  additionalProperties: false,
                },
              },
              additionalProperties: false,
            },
          ],
        };

        const result = await validateDataContract(rawDataContract);

        expectJsonSchemaError(result, 3);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.documents[\'niceDocument\'].properties[\'object\'].items[0].properties[\'something\']');
        expect(error.keyword).to.equal('required');
        expect(error.params.missingProperty).to.equal('.properties');
      });

      it('should have valid property names', async () => {
        const validNames = ['validName', 'valid_name', 'valid-name', 'abc', '123abc', 'abc123', 'ValidName', 'validName',
          'abcdefghigklmnopqrstuvwxyz01234567890abcdefghigklmnopqrstuvwxyz', 'abc_gbf_gdb', 'abc-gbf-gdb'];

        await Promise.all(
          validNames.map(async (name) => {
            rawDataContract.documents.niceDocument.properties[name] = {
              type: 'string',
            };

            const result = await validateDataContract(rawDataContract);

            expectJsonSchemaError(result, 0);
          }),
        );
      });

      it('should have valid nested property names', async () => {
        const validNames = ['validName', 'valid_name', 'valid-name', 'abc', '123abc', 'abc123', 'ValidName', 'validName',
          'abcdefghigklmnopqrstuvwxyz01234567890abcdefghigklmnopqrstuvwxyz', 'abc_gbf_gdb', 'abc-gbf-gdb'];

        rawDataContract.documents.niceDocument.properties.something = {
          properties: {},
          additionalProperties: false,
        };

        await Promise.all(
          validNames.map(async (name) => {
            rawDataContract.documents.niceDocument.properties.something.properties[name] = {
              type: 'string',
            };

            const result = await validateDataContract(rawDataContract);

            expectJsonSchemaError(result, 0);
          }),
        );
      });

      it('should return an invalid result if a property has invalid format', async () => {
        const invalidNames = ['-invalidname', '_invalidname', 'invalidname-', 'invalidname_', '*(*&^', '$test'];

        await Promise.all(
          invalidNames.map(async (name) => {
            rawDataContract.documents.niceDocument.properties[name] = {};

            const result = await validateDataContract(rawDataContract);

            expectJsonSchemaError(result, 2);

            const errors = result.getErrors();

            expect(errors[0].dataPath).to.equal('.documents[\'niceDocument\'].properties');
            expect(errors[0].keyword).to.equal('pattern');
            expect(errors[1].dataPath).to.equal('.documents[\'niceDocument\'].properties');
            expect(errors[1].keyword).to.equal('propertyNames');
          }),
        );
      });

      it('should return an invalid result if a nested property has invalid format', async () => {
        const invalidNames = ['-invalidname', '_invalidname', 'invalidname-', 'invalidname_', '*(*&^', '$test'];

        rawDataContract.documents.niceDocument.properties.something = {
          properties: {},
          additionalProperties: false,
        };

        await Promise.all(
          invalidNames.map(async (name) => {
            rawDataContract.documents.niceDocument.properties.something.properties[name] = {};

            const result = await validateDataContract(rawDataContract);

            expectJsonSchemaError(result, 2);

            const errors = result.getErrors();

            expect(errors[0].dataPath).to.equal(
              '.documents[\'niceDocument\'].properties[\'something\'].properties',
            );
            expect(errors[0].keyword).to.equal('pattern');
            expect(errors[1].dataPath).to.equal(
              '.documents[\'niceDocument\'].properties[\'something\'].properties',
            );
            expect(errors[1].keyword).to.equal('propertyNames');
          }),
        );
      });

      it('should have "additionalProperties" defined', async () => {
        delete rawDataContract.documents.niceDocument.additionalProperties;

        const result = await validateDataContract(rawDataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.documents[\'niceDocument\']');
        expect(error.keyword).to.equal('required');
        expect(error.params.missingProperty).to.equal('.additionalProperties');
      });

      it('should have "additionalProperties" defined to false', async () => {
        rawDataContract.documents.niceDocument.additionalProperties = true;

        const result = await validateDataContract(rawDataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.documents[\'niceDocument\'].additionalProperties');
        expect(error.keyword).to.equal('const');
      });

      it('should have nested "additionalProperties" defined', async () => {
        rawDataContract.documents.niceDocument.properties.object = {
          type: 'array',
          items: [
            {
              properties: {
                something: {
                  type: 'string',
                },
              },
            },
          ],
        };

        const result = await validateDataContract(rawDataContract);

        expectJsonSchemaError(result, 3);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.documents[\'niceDocument\'].properties[\'object\'].items[0]');
        expect(error.keyword).to.equal('required');
        expect(error.params.missingProperty).to.equal('.additionalProperties');
      });

      it('should return invalid result if there are additional properties', async () => {
        rawDataContract.additionalProperty = { };

        const result = await validateDataContract(rawDataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('');
        expect(error.keyword).to.equal('additionalProperties');
      });

      it('should have no more than 100 properties', async () => {
        const propertyDefinition = { };

        rawDataContract.documents.niceDocument.properties = {};

        Array(101).fill(propertyDefinition).forEach((item, i) => {
          rawDataContract.documents.niceDocument.properties[i] = item;
        });

        const result = await validateDataContract(rawDataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.documents[\'niceDocument\'].properties');
        expect(error.keyword).to.equal('maxProperties');
      });

      it('should have defined items for arrays', async () => {
        rawDataContract.documents.new = {
          properties: {
            something: {
              type: 'array',
            },
          },
          additionalProperties: false,
        };

        const result = await validateDataContract(rawDataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.documents[\'new\'].properties[\'something\']');
        expect(error.keyword).to.equal('required');
        expect(error.params.missingProperty).to.equal('.items');
      });

      it('should not have additionalItems for arrays if items is subschema', async () => {
        rawDataContract.documents.new = {
          properties: {
            something: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
          additionalProperties: false,
        };

        const result = await validateDataContract(rawDataContract);

        expectJsonSchemaError(result, 0);
      });

      it('should have additionalItems for arrays', async () => {
        rawDataContract.documents.new = {
          properties: {
            something: {
              type: 'array',
              items: [
                {
                  type: 'string',
                },
                {
                  type: 'number',
                },
              ],
            },
          },
          additionalProperties: false,
        };

        const result = await validateDataContract(rawDataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.documents[\'new\'].properties[\'something\']');
        expect(error.keyword).to.equal('required');
        expect(error.params.missingProperty).to.equal('.additionalItems');
      });

      it('should have additionalItems disabled for arrays', async () => {
        rawDataContract.documents.new = {
          properties: {
            something: {
              type: 'array',
              items: [
                {
                  type: 'string',
                },
                {
                  type: 'number',
                },
              ],
              additionalItems: false,
            },
          },
          additionalProperties: false,
        };

        const result = await validateDataContract(rawDataContract);

        expectJsonSchemaError(result, 0);
      });

      it('should not have additionalItems enabled for arrays', async () => {
        rawDataContract.documents.new = {
          properties: {
            something: {
              type: 'array',
              items: [
                {
                  type: 'string',
                },
                {
                  type: 'number',
                },
              ],
              additionalItems: true,
            },
          },
          additionalProperties: false,
        };

        const result = await validateDataContract(rawDataContract);

        expectJsonSchemaError(result, 3);

        const [shouldBeAnObjectError, shouldEqualConstant] = result.getErrors();

        expect(shouldBeAnObjectError.dataPath).to.equal(
          '.documents[\'new\'].properties[\'something\'].additionalItems',
        );
        expect(shouldBeAnObjectError.keyword).to.equal('type');

        expect(shouldEqualConstant.dataPath).to.equal(
          '.documents[\'new\'].properties[\'something\'].additionalItems',
        );
        expect(shouldEqualConstant.keyword).to.equal('const');
      });

      it('should return invalid result if "default" keyword is used', async () => {
        rawDataContract.documents.indexedDocument.properties.firstName.default = '1';

        const result = await validateDataContract(rawDataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.documents[\'indexedDocument\'].properties[\'firstName\']');
        expect(error.keyword).to.equal('additionalProperties');
      });

      it('should return invalid result if remote `$ref` is used', async () => {
        rawDataContract.documents.indexedDocument = {
          $ref: 'http://remote.com/schema#',
        };

        const result = await validateDataContract(rawDataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.documents[\'indexedDocument\'].$ref');
        expect(error.keyword).to.equal('pattern');
      });

      it('should not have `propertyNames`', async () => {
        rawDataContract.documents.indexedDocument = {
          type: 'object',
          properties: {
            something: {
              type: 'string',
            },
          },
          propertyNames: {
            pattern: 'abc',
          },
          additionalProperties: false,
        };

        const result = await validateDataContract(rawDataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.documents[\'indexedDocument\']');
        expect(error.keyword).to.equal('additionalProperties');
        expect(error.params.additionalProperty).to.equal('propertyNames');
      });

      it('should have `maxItems` if `uniqueItems` is used', async () => {
        rawDataContract.documents.indexedDocument = {
          type: 'object',
          properties: {
            something: {
              type: 'array',
              uniqueItems: true,
            },
          },
          additionalProperties: false,
        };

        const result = await validateDataContract(rawDataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.documents[\'indexedDocument\'].properties[\'something\']');
        expect(error.keyword).to.equal('required');
        expect(error.params.missingProperty).to.equal('maxItems');
      });

      it('should have `maxItems` no bigger than 10000 if `uniqueItems` is used', async () => {
        rawDataContract.documents.indexedDocument = {
          type: 'object',
          properties: {
            something: {
              type: 'array',
              uniqueItems: true,
              maxItems: 200000,
            },
          },
          additionalProperties: false,
        };

        const result = await validateDataContract(rawDataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.documents[\'indexedDocument\'].properties[\'something\'].maxItems');
        expect(error.keyword).to.equal('maximum');
      });

      it('should have `maxLength` if `pattern` is used', async () => {
        rawDataContract.documents.indexedDocument = {
          type: 'object',
          properties: {
            something: {
              type: 'string',
              pattern: 'a',
            },
          },
          additionalProperties: false,
        };

        const result = await validateDataContract(rawDataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.documents[\'indexedDocument\'].properties[\'something\']');
        expect(error.keyword).to.equal('required');
        expect(error.params.missingProperty).to.equal('maxLength');
      });

      it('should have `maxLength` no bigger than 50000 if `pattern` is used', async () => {
        rawDataContract.documents.indexedDocument = {
          type: 'object',
          properties: {
            something: {
              type: 'string',
              pattern: 'a',
              maxLength: 60000,
            },
          },
          additionalProperties: false,
        };

        const result = await validateDataContract(rawDataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.documents[\'indexedDocument\'].properties[\'something\'].maxLength');
        expect(error.keyword).to.equal('maximum');
      });

      it('should have `maxLength` if `format` is used', async () => {
        rawDataContract.documents.indexedDocument = {
          type: 'object',
          properties: {
            something: {
              type: 'string',
              format: 'url',
            },
          },
          additionalProperties: false,
        };

        const result = await validateDataContract(rawDataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.documents[\'indexedDocument\'].properties[\'something\']');
        expect(error.keyword).to.equal('required');
        expect(error.params.missingProperty).to.equal('maxLength');
      });

      it('should have `maxLength` no bigger than 50000 if `format` is used', async () => {
        rawDataContract.documents.indexedDocument = {
          type: 'object',
          properties: {
            something: {
              type: 'string',
              format: 'url',
              maxLength: 60000,
            },
          },
          additionalProperties: false,
        };

        const result = await validateDataContract(rawDataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.documents[\'indexedDocument\'].properties[\'something\'].maxLength');
        expect(error.keyword).to.equal('maximum');
      });
    });
  });

  describe('indices', () => {
    it('should be an array', async () => {
      rawDataContract.documents.indexedDocument.indices = 'definitely not an array';

      const result = await validateDataContract(rawDataContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.documents[\'indexedDocument\'].indices');
      expect(error.keyword).to.equal('type');
    });

    it('should have at least one item', async () => {
      rawDataContract.documents.indexedDocument.indices = [];

      const result = await validateDataContract(rawDataContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.documents[\'indexedDocument\'].indices');
      expect(error.keyword).to.equal('minItems');
    });

    it('should return invalid result if there are duplicated indices', async () => {
      const indexDefinition = { ...rawDataContract.documents.indexedDocument.indices[0] };

      rawDataContract.documents.indexedDocument.indices.push(indexDefinition);

      const result = await validateDataContract(rawDataContract);

      expectValidationError(result, DuplicateIndexError);

      const [error] = result.getErrors();

      expect(error.getIndexDefinition()).to.deep.equal(indexDefinition);
      expect(error.getRawDataContract()).to.deep.equal(rawDataContract);
      expect(error.getDocumentType()).to.deep.equal('indexedDocument');
    });

    describe('index', () => {
      it('should be an object', async () => {
        rawDataContract.documents.indexedDocument.indices = ['something else'];

        const result = await validateDataContract(rawDataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.documents[\'indexedDocument\'].indices[0]');
        expect(error.keyword).to.equal('type');
      });

      it('should have properties definition', async () => {
        rawDataContract.documents.indexedDocument.indices = [{}];

        const result = await validateDataContract(rawDataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.documents[\'indexedDocument\'].indices[0]');
        expect(error.params.missingProperty).to.equal('properties');
        expect(error.keyword).to.equal('required');
      });

      describe('properties definition', () => {
        it('should be an array', async () => {
          rawDataContract.documents.indexedDocument.indices[0]
            .properties = 'something else';

          const result = await validateDataContract(rawDataContract);

          expectJsonSchemaError(result);

          const [error] = result.getErrors();

          expect(error.dataPath).to.equal(
            '.documents[\'indexedDocument\'].indices[0].properties',
          );
          expect(error.keyword).to.equal('type');
        });

        it('should have at least one property defined', async () => {
          rawDataContract.documents.indexedDocument.indices[0]
            .properties = [];

          const result = await validateDataContract(rawDataContract);

          expectJsonSchemaError(result);

          const [error] = result.getErrors();

          expect(error.dataPath).to.equal(
            '.documents[\'indexedDocument\'].indices[0].properties',
          );
          expect(error.keyword).to.equal('minItems');
        });

        it('should have no more than 10 property definitions', async () => {
          for (let i = 0; i < 10; i++) {
            rawDataContract.documents.indexedDocument.indices[0]
              .properties.push({ [`field${i}`]: 'asc' });
          }

          const result = await validateDataContract(rawDataContract);

          expectJsonSchemaError(result);

          const [error] = result.getErrors();

          expect(error.dataPath).to.equal(
            '.documents[\'indexedDocument\'].indices[0].properties',
          );
          expect(error.keyword).to.equal('maxItems');
        });

        describe('property definition', () => {
          it('should be an object', async () => {
            rawDataContract.documents.indexedDocument.indices[0]
              .properties[0] = 'something else';

            const result = await validateDataContract(rawDataContract);

            expectJsonSchemaError(result);

            const [error] = result.getErrors();

            expect(error.dataPath).to.equal(
              '.documents[\'indexedDocument\'].indices[0].properties[0]',
            );
            expect(error.keyword).to.equal('type');
          });

          it('should have at least one property', async () => {
            rawDataContract.documents.indexedDocument.indices[0]
              .properties = [];

            const result = await validateDataContract(rawDataContract);

            expectJsonSchemaError(result);

            const [error] = result.getErrors();

            expect(error.dataPath).to.equal(
              '.documents[\'indexedDocument\'].indices[0].properties',
            );
            expect(error.keyword).to.equal('minItems');
          });

          it('should have no more than one property', async () => {
            const property = rawDataContract.documents.indexedDocument.indices[0]
              .properties[0];

            property.anotherField = 'something';

            const result = await validateDataContract(rawDataContract);

            expectJsonSchemaError(result);

            const [error] = result.getErrors();

            expect(error.dataPath).to.equal(
              '.documents[\'indexedDocument\'].indices[0].properties[0]',
            );
            expect(error.keyword).to.equal('maxProperties');
          });

          it('should have property values only "asc" or "desc"', async () => {
            rawDataContract.documents.indexedDocument.indices[0]
              .properties[0].$userId = 'wrong';

            const result = await validateDataContract(rawDataContract);

            expectJsonSchemaError(result);

            const [error] = result.getErrors();

            expect(error.dataPath).to.equal(
              '.documents[\'indexedDocument\'].indices[0].properties[0][\'$userId\']',
            );
            expect(error.keyword).to.equal('enum');
          });
        });
      });

      it('should have "unique" flag to be of a boolean type', async () => {
        rawDataContract.documents.indexedDocument.indices[0].unique = 12;

        const result = await validateDataContract(rawDataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.documents[\'indexedDocument\'].indices[0].unique');
        expect(error.keyword).to.equal('type');
      });

      it('should have no more than 10 indices', async () => {
        for (let i = 0; i < 10; i++) {
          const propertyName = `field${i}`;

          rawDataContract.documents.indexedDocument.properties[propertyName] = { type: 'string' };

          rawDataContract.documents.indexedDocument.indices.push({
            properties: [{ [propertyName]: 'asc' }],
          });
        }

        const result = await validateDataContract(rawDataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal(
          '.documents[\'indexedDocument\'].indices',
        );
        expect(error.keyword).to.equal('maxItems');
      });

      it('should have no more than 3 unique indices', async () => {
        for (let i = 0; i < 4; i++) {
          const propertyName = `field${i}`;

          rawDataContract.documents.indexedDocument.properties[propertyName] = { type: 'string' };

          rawDataContract.documents.indexedDocument.indices.push({
            properties: [{ [propertyName]: 'asc' }],
            unique: true,
          });
        }

        const result = await validateDataContract(rawDataContract);

        expectValidationError(result, UniqueIndicesLimitReached);

        const [error] = result.getErrors();

        expect(error.getRawDataContract()).to.equal(rawDataContract);
        expect(error.getDocumentType()).to.equal('indexedDocument');
      });

      it('should return invalid result if indices has undefined property', async () => {
        const indexDefinition = rawDataContract.documents.indexedDocument.indices[0];

        indexDefinition.properties.push({
          missingProperty: 'asc',
        });

        const result = await validateDataContract(rawDataContract);

        expectValidationError(result, UndefinedIndexPropertyError);

        const [error] = result.getErrors();

        expect(error.getPropertyName()).to.equal('missingProperty');
        expect(error.getRawDataContract()).to.deep.equal(rawDataContract);
        expect(error.getDocumentType()).to.deep.equal('indexedDocument');
        expect(error.getIndexDefinition()).to.deep.equal(indexDefinition);
      });

      it('should return invalid result if index property is object', async () => {
        const propertiesDefinition = rawDataContract.documents.indexedDocument.properties;

        propertiesDefinition.objectProperty = {
          type: 'object',
          properties: {
            something: {
              type: 'string',
            },
          },
          additionalProperties: false,
        };

        const indexDefinition = rawDataContract.documents.indexedDocument.indices[0];

        indexDefinition.properties.push({
          objectProperty: 'asc',
        });

        const result = await validateDataContract(rawDataContract);

        expectValidationError(result, InvalidIndexPropertyTypeError);

        const [error] = result.getErrors();

        expect(error.getPropertyName()).to.equal('objectProperty');
        expect(error.getPropertyType()).to.equal('object');
        expect(error.getRawDataContract()).to.deep.equal(rawDataContract);
        expect(error.getDocumentType()).to.deep.equal('indexedDocument');
        expect(error.getIndexDefinition()).to.deep.equal(indexDefinition);
      });

      it('should return invalid result if index property is array of objects', async () => {
        const propertiesDefinition = rawDataContract.documents.indexedDocument.properties;

        propertiesDefinition.arrayProperty = {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              something: {
                type: 'string',
              },
            },
            additionalProperties: false,
          },
        };

        const indexDefinition = rawDataContract.documents.indexedDocument.indices[0];

        indexDefinition.properties.push({
          arrayProperty: 'asc',
        });

        const result = await validateDataContract(rawDataContract);

        expectValidationError(result, InvalidIndexPropertyTypeError);

        const [error] = result.getErrors();

        expect(error.getPropertyName()).to.equal('arrayProperty');
        expect(error.getPropertyType()).to.equal('array');
        expect(error.getRawDataContract()).to.deep.equal(rawDataContract);
        expect(error.getDocumentType()).to.deep.equal('indexedDocument');
        expect(error.getIndexDefinition()).to.deep.equal(indexDefinition);
      });

      it('should return invalid result if index property is array of arrays', async () => {
        const propertiesDefinition = rawDataContract.documents.indexedDocument.properties;

        propertiesDefinition.arrayProperty = {
          type: 'array',
          items: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        };

        const indexDefinition = rawDataContract.documents.indexedDocument.indices[0];

        indexDefinition.properties.push({
          arrayProperty: 'asc',
        });

        const result = await validateDataContract(rawDataContract);

        expectValidationError(result, InvalidIndexPropertyTypeError);

        const [error] = result.getErrors();

        expect(error.getPropertyName()).to.equal('arrayProperty');
        expect(error.getPropertyType()).to.equal('array');
        expect(error.getRawDataContract()).to.deep.equal(rawDataContract);
        expect(error.getDocumentType()).to.deep.equal('indexedDocument');
        expect(error.getIndexDefinition()).to.deep.equal(indexDefinition);
      });

      it('should return invalid result if index property is array with many item definitions', async () => {
        const propertiesDefinition = rawDataContract.documents.indexedDocument.properties;

        propertiesDefinition.arrayProperty = {
          type: 'array',
          items: [{
            type: 'string',
          }, {
            type: 'number',
          }],
          additionalItems: false,
        };

        const indexDefinition = rawDataContract.documents.indexedDocument.indices[0];

        indexDefinition.properties.push({
          arrayProperty: 'asc',
        });

        const result = await validateDataContract(rawDataContract);

        expectValidationError(result, InvalidIndexPropertyTypeError);

        const [error] = result.getErrors();

        expect(error.getPropertyName()).to.equal('arrayProperty');
        expect(error.getPropertyType()).to.equal('array');
        expect(error.getRawDataContract()).to.deep.equal(rawDataContract);
        expect(error.getDocumentType()).to.deep.equal('indexedDocument');
        expect(error.getIndexDefinition()).to.deep.equal(indexDefinition);
      });

      it('should return invalid result if index property is a single $id', async () => {
        const indexDefinition = {
          properties: [
            { $id: 'asc' },
          ],
        };

        const indeciesDefinition = rawDataContract.documents.indexedDocument.indices;

        indeciesDefinition.push(indexDefinition);

        const result = await validateDataContract(rawDataContract);

        expectValidationError(result, SystemPropertyIndexAlreadyPresentError);

        const [error] = result.getErrors();

        expect(error.getPropertyName()).to.equal('$id');
        expect(error.getRawDataContract()).to.deep.equal(rawDataContract);
        expect(error.getDocumentType()).to.deep.equal('indexedDocument');
        expect(error.getIndexDefinition()).to.deep.equal(indexDefinition);
      });
    });
  });

  it('should return invalid result with circular $ref pointer', async () => {
    rawDataContract.definitions.object = { $ref: '#/definitions/object' };

    const result = await validateDataContract(rawDataContract);

    expectJsonSchemaError(result);

    const [error] = result.getErrors();

    expect(error.message).to.be.a('string').and.satisfy((msg) => (
      msg.startsWith('Circular $ref pointer')
    ));
  });

  it('should return valid result if Data Contract is valid', async () => {
    const result = await validateDataContract(rawDataContract);

    expect(result).to.be.an.instanceOf(ValidationResult);
    expect(result.isValid()).to.be.true();
  });
});
