const Ajv = require('ajv');

const JsonSchemaValidator = require('../../../lib/validation/JsonSchemaValidator');

const ValidationResult = require('../../../lib/validation/ValidationResult');

const validateDPContractFactory = require('../../../lib/contract/validateDPContractFactory');

const getDPContractFixture = require('../../../lib/test/fixtures/getDPContractFixture');

const { expectJsonSchemaError, expectValidationError } = require('../../../lib/test/expect/expectError');

const DuplicateIndexError = require('../../../lib/errors/DuplicateIndexError');
const UniqueIndexMustHaveUserIdPrefixError = require('../../../lib/errors/UniqueIndexMustHaveUserIdPrefixError');
const UndefinedIndexPropertyError = require('../../../lib/errors/UndefinedIndexPropertyError');

describe('validateDPContractFactory', () => {
  let rawDPContract;
  let validateDPContract;

  beforeEach(() => {
    rawDPContract = getDPContractFixture().toJSON();

    const ajv = new Ajv();
    const validator = new JsonSchemaValidator(ajv);

    validateDPContract = validateDPContractFactory(validator);
  });

  describe('$schema', () => {
    it('should be present', () => {
      delete rawDPContract.$schema;

      const result = validateDPContract(rawDPContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('');
      expect(error.keyword).to.equal('required');
      expect(error.params.missingProperty).to.equal('$schema');
    });

    it('should be a string', () => {
      rawDPContract.$schema = 1;

      const result = validateDPContract(rawDPContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.$schema');
      expect(error.keyword).to.equal('type');
    });

    it('should be a particular url', () => {
      rawDPContract.$schema = 'wrong';

      const result = validateDPContract(rawDPContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.keyword).to.equal('const');
      expect(error.dataPath).to.equal('.$schema');
    });
  });

  describe('name', () => {
    it('should be present', () => {
      delete rawDPContract.name;

      const result = validateDPContract(rawDPContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('');
      expect(error.keyword).to.equal('required');
      expect(error.params.missingProperty).to.equal('name');
    });

    it('should be a string', () => {
      rawDPContract.name = 1;

      const result = validateDPContract(rawDPContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.name');
      expect(error.keyword).to.equal('type');
    });

    it('should be greater or equal to 3', () => {
      rawDPContract.name = 'a'.repeat(2);

      const result = validateDPContract(rawDPContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.name');
      expect(error.keyword).to.equal('minLength');
    });

    it('should be less or equal to 24', () => {
      rawDPContract.name = 'a'.repeat(25);

      const result = validateDPContract(rawDPContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.name');
      expect(error.keyword).to.equal('maxLength');
    });

    it('should be an alphanumeric string', () => {
      rawDPContract.name = '*(*&^';

      const result = validateDPContract(rawDPContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.name');
      expect(error.keyword).to.equal('pattern');
    });
  });

  describe('version', () => {
    it('should be present', () => {
      delete rawDPContract.version;

      const result = validateDPContract(rawDPContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('');
      expect(error.keyword).to.equal('required');
      expect(error.params.missingProperty).to.equal('version');
    });

    it('should be a number', () => {
      rawDPContract.version = 'wrong';

      const result = validateDPContract(rawDPContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.version');
      expect(error.keyword).to.equal('type');
    });

    it('should be an integer', () => {
      rawDPContract.version = 1.2;

      const result = validateDPContract(rawDPContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.version');
      expect(error.keyword).to.equal('multipleOf');
    });

    it('should be greater or equal to one', () => {
      rawDPContract.version = 0;

      const result = validateDPContract(rawDPContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.version');
      expect(error.keyword).to.equal('minimum');
    });
  });

  describe('definitions', () => {
    it('may not be present', () => {
      delete rawDPContract.definitions;

      const result = validateDPContract(rawDPContract);

      expect(result).to.be.an.instanceOf(ValidationResult);
      expect(result.isValid()).to.be.true();
    });

    it('should be an object', () => {
      rawDPContract.definitions = 1;

      const result = validateDPContract(rawDPContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.definitions');
      expect(error.keyword).to.equal('type');
    });

    it('should not be empty', () => {
      rawDPContract.definitions = {};

      const result = validateDPContract(rawDPContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.definitions');
      expect(error.keyword).to.equal('minProperties');
    });

    it('should have no non-alphanumeric properties', () => {
      rawDPContract.definitions = {
        $subSchema: {},
      };

      const result = validateDPContract(rawDPContract);

      expectJsonSchemaError(result, 2);

      const [patternError, propertyNamesError] = result.getErrors();

      expect(patternError.dataPath).to.equal('.definitions');
      expect(patternError.keyword).to.equal('pattern');

      expect(propertyNamesError.dataPath).to.equal('.definitions');
      expect(propertyNamesError.keyword).to.equal('propertyNames');
    });

    it('should have no more than 100 properties', () => {
      rawDPContract.definitions = {};

      Array(101).fill({}).forEach((item, i) => {
        rawDPContract.definitions[i] = item;
      });

      const result = validateDPContract(rawDPContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.definitions');
      expect(error.keyword).to.equal('maxProperties');
    });
  });

  describe('documents', () => {
    it('should be present', () => {
      delete rawDPContract.documents;

      const result = validateDPContract(rawDPContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('');
      expect(error.keyword).to.equal('required');
      expect(error.params.missingProperty).to.equal('documents');
    });

    it('should be an object', () => {
      rawDPContract.documents = 1;

      const result = validateDPContract(rawDPContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.documents');
      expect(error.keyword).to.equal('type');
    });

    it('should not be empty', () => {
      rawDPContract.documents = {};

      const result = validateDPContract(rawDPContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.documents');
      expect(error.keyword).to.equal('minProperties');
    });

    it('should have no non-alphanumeric properties', () => {
      rawDPContract.documents['(*&^'] = rawDPContract.documents.niceObject;

      const result = validateDPContract(rawDPContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.documents');
      expect(error.keyword).to.equal('additionalProperties');
    });

    it('should have no more than 100 properties', () => {
      const niceObjectDefinition = rawDPContract.documents.niceObject;

      rawDPContract.documents = {};

      Array(101).fill(niceObjectDefinition).forEach((item, i) => {
        rawDPContract.documents[i] = item;
      });

      const result = validateDPContract(rawDPContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.documents');
      expect(error.keyword).to.equal('maxProperties');
    });

    describe('DPObject schema', () => {
      it('should not be empty', () => {
        rawDPContract.documents.niceObject.properties = {};

        const result = validateDPContract(rawDPContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.documents[\'niceObject\'].properties');
        expect(error.keyword).to.equal('minProperties');
      });

      it('should have type "object" if defined', () => {
        delete rawDPContract.documents.niceObject.properties;

        const result = validateDPContract(rawDPContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.documents[\'niceObject\']');
        expect(error.keyword).to.equal('required');
        expect(error.params.missingProperty).to.equal('properties');
      });

      it('should have "properties"', () => {
        delete rawDPContract.documents.niceObject.properties;

        const result = validateDPContract(rawDPContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.documents[\'niceObject\']');
        expect(error.keyword).to.equal('required');
        expect(error.params.missingProperty).to.equal('properties');
      });

      it('should have no non-alphanumeric properties', () => {
        rawDPContract.documents.niceObject.properties['(*&^'] = {};

        const result = validateDPContract(rawDPContract);

        expectJsonSchemaError(result, 2);

        const errors = result.getErrors();

        expect(errors[0].dataPath).to.equal('.documents[\'niceObject\'].properties');
        expect(errors[0].keyword).to.equal('pattern');
        expect(errors[1].dataPath).to.equal('.documents[\'niceObject\'].properties');
        expect(errors[1].keyword).to.equal('propertyNames');
      });

      it('should have "additionalProperties" defined', () => {
        delete rawDPContract.documents.niceObject.additionalProperties;

        const result = validateDPContract(rawDPContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.documents[\'niceObject\']');
        expect(error.keyword).to.equal('required');
        expect(error.params.missingProperty).to.equal('additionalProperties');
      });

      it('should have "additionalProperties" defined to false', () => {
        rawDPContract.documents.niceObject.additionalProperties = true;

        const result = validateDPContract(rawDPContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.documents[\'niceObject\'].additionalProperties');
        expect(error.keyword).to.equal('const');
      });

      it('should have no more than 100 properties', () => {
        const propertyDefinition = { };

        rawDPContract.documents.niceObject.properties = {};

        Array(101).fill(propertyDefinition).forEach((item, i) => {
          rawDPContract.documents.niceObject.properties[i] = item;
        });

        const result = validateDPContract(rawDPContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.documents[\'niceObject\'].properties');
        expect(error.keyword).to.equal('maxProperties');
      });
    });
  });

  describe('indices', () => {
    it('should be an array', () => {
      rawDPContract.documents.indexedObject.indices = 'definetely not an array';

      const result = validateDPContract(rawDPContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.documents[\'indexedObject\'].indices');
      expect(error.keyword).to.equal('type');
    });

    it('should have at least one item', () => {
      rawDPContract.documents.indexedObject.indices = [];

      const result = validateDPContract(rawDPContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.documents[\'indexedObject\'].indices');
      expect(error.keyword).to.equal('minItems');
    });

    describe('index', () => {
      it('should be an object', () => {
        rawDPContract.documents.indexedObject.indices = ['something else'];

        const result = validateDPContract(rawDPContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.documents[\'indexedObject\'].indices[0]');
        expect(error.keyword).to.equal('type');
      });

      it('should have properties definition', () => {
        rawDPContract.documents.indexedObject.indices = [{}];

        const result = validateDPContract(rawDPContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.documents[\'indexedObject\'].indices[0]');
        expect(error.params.missingProperty).to.equal('properties');
        expect(error.keyword).to.equal('required');
      });

      describe('properties definition', () => {
        it('should be an array', () => {
          rawDPContract.documents.indexedObject.indices[0]
            .properties = 'something else';

          const result = validateDPContract(rawDPContract);

          expectJsonSchemaError(result);

          const [error] = result.getErrors();

          expect(error.dataPath).to.equal(
            '.documents[\'indexedObject\'].indices[0].properties',
          );
          expect(error.keyword).to.equal('type');
        });

        it('should have at least one property defined', () => {
          rawDPContract.documents.indexedObject.indices[0]
            .properties = [];

          const result = validateDPContract(rawDPContract);

          expectJsonSchemaError(result);

          const [error] = result.getErrors();

          expect(error.dataPath).to.equal(
            '.documents[\'indexedObject\'].indices[0].properties',
          );
          expect(error.keyword).to.equal('minItems');
        });

        it('should have no more than 100 property definitions', () => {
          for (let i = 0; i < 100; i++) {
            rawDPContract.documents.indexedObject.indices[0]
              .properties.push({
                [`field${i}`]: 'asc',
              });
          }

          const result = validateDPContract(rawDPContract);

          expectJsonSchemaError(result);

          const [error] = result.getErrors();

          expect(error.dataPath).to.equal(
            '.documents[\'indexedObject\'].indices[0].properties',
          );
          expect(error.keyword).to.equal('maxItems');
        });

        describe('property definition', () => {
          it('should be an object', () => {
            rawDPContract.documents.indexedObject.indices[0]
              .properties[0] = 'something else';

            const result = validateDPContract(rawDPContract);

            expectJsonSchemaError(result);

            const [error] = result.getErrors();

            expect(error.dataPath).to.equal(
              '.documents[\'indexedObject\'].indices[0].properties[0]',
            );
            expect(error.keyword).to.equal('type');
          });

          it('should have at least one property', () => {
            rawDPContract.documents.indexedObject.indices[0]
              .properties = [];

            const result = validateDPContract(rawDPContract);

            expectJsonSchemaError(result);

            const [error] = result.getErrors();

            expect(error.dataPath).to.equal(
              '.documents[\'indexedObject\'].indices[0].properties',
            );
            expect(error.keyword).to.equal('minItems');
          });

          it('should have no more than one property', () => {
            const property = rawDPContract.documents.indexedObject.indices[0]
              .properties[0];

            property.anotherField = 'something';

            const result = validateDPContract(rawDPContract);

            expectJsonSchemaError(result);

            const [error] = result.getErrors();

            expect(error.dataPath).to.equal(
              '.documents[\'indexedObject\'].indices[0].properties[0]',
            );
            expect(error.keyword).to.equal('maxProperties');
          });

          it('should have property values only "asc" or "desc"', () => {
            rawDPContract.documents.indexedObject.indices[0]
              .properties[0].$userId = 'wrong';

            const result = validateDPContract(rawDPContract);

            expectJsonSchemaError(result);

            const [error] = result.getErrors();

            expect(error.dataPath).to.equal(
              '.documents[\'indexedObject\'].indices[0].properties[0][\'$userId\']',
            );
            expect(error.keyword).to.equal('enum');
          });
        });
      });

      it('should have "unique" flag', () => {
        rawDPContract.documents.indexedObject.indices[0].unique = undefined;

        const result = validateDPContract(rawDPContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.documents[\'indexedObject\'].indices[0]');
        expect(error.params.missingProperty).to.equal('unique');
        expect(error.keyword).to.equal('required');
      });

      it('should have "unqiue" flag equal "true"', () => {
        rawDPContract.documents.indexedObject.indices[0].unique = false;

        const result = validateDPContract(rawDPContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.documents[\'indexedObject\'].indices[0].unique');
        expect(error.keyword).to.equal('const');
      });
    });
  });

  it('should return invalid result if there are additional properties', () => {
    rawDPContract.additionalProperty = { };

    const result = validateDPContract(rawDPContract);

    expectJsonSchemaError(result);

    const [error] = result.getErrors();

    expect(error.dataPath).to.equal('');
    expect(error.keyword).to.equal('additionalProperties');
  });

  it('should return invalid result if there are duplicated indices', () => {
    const indexDefinition = Object.assign({},
      rawDPContract.documents.indexedObject.indices[0]);

    rawDPContract.documents.indexedObject.indices.push(indexDefinition);

    const result = validateDPContract(rawDPContract);

    expectValidationError(result, DuplicateIndexError);

    const [error] = result.getErrors();

    expect(error.getIndexDefinition()).to.deep.equal(indexDefinition);
    expect(error.getRawDPContract()).to.deep.equal(rawDPContract);
    expect(error.getDocumentType()).to.deep.equal('indexedObject');
  });

  it('should return invalid result if indices don\'t have $userId prefix', () => {
    const indexDefinition = rawDPContract.documents.indexedObject.indices[0];

    const firstIndex = indexDefinition.properties.shift();
    indexDefinition.properties.push(firstIndex);

    const result = validateDPContract(rawDPContract);

    expectValidationError(result, UniqueIndexMustHaveUserIdPrefixError);

    const [error] = result.getErrors();

    expect(error.getIndexDefinition()).to.deep.equal(indexDefinition);
    expect(error.getRawDPContract()).to.deep.equal(rawDPContract);
    expect(error.getDocumentType()).to.deep.equal('indexedObject');
  });

  it('should return invalid result if indices don\'t have $userId prefix as a first field', () => {
    const indexDefinition = rawDPContract.documents.indexedObject.indices[0];

    indexDefinition.properties.shift();

    const result = validateDPContract(rawDPContract);

    expectValidationError(result, UniqueIndexMustHaveUserIdPrefixError);

    const [error] = result.getErrors();

    expect(error.getIndexDefinition()).to.deep.equal(indexDefinition);
  });

  it('should return invalid result if indices has undefined property', () => {
    const indexDefinition = rawDPContract.documents.indexedObject.indices[0];

    indexDefinition.properties.push({
      missingProperty: 'asc',
    });

    const result = validateDPContract(rawDPContract);

    expectValidationError(result, UndefinedIndexPropertyError);

    const [error] = result.getErrors();

    expect(error.getPropertyName()).to.equal('missingProperty');
    expect(error.getRawDPContract()).to.deep.equal(rawDPContract);
    expect(error.getDocumentType()).to.deep.equal('indexedObject');
    expect(error.getIndexDefinition()).to.deep.equal(indexDefinition);
  });

  it('should return valid result if contract is valid', () => {
    const result = validateDPContract(rawDPContract);

    expect(result).to.be.an.instanceOf(ValidationResult);
    expect(result.isValid()).to.be.true();
  });
});
