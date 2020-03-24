const Ajv = require('ajv');

const JsonSchemaValidator = require('../../../lib/validation/JsonSchemaValidator');
const ValidationResult = require('../../../lib/validation/ValidationResult');

const validateDocumentFactory = require('../../../lib/document/validateDocumentFactory');
const enrichDataContractWithBaseSchema = require('../../../lib/dataContract/enrichDataContractWithBaseSchema');

const getDocumentsFixture = require('../../../lib/test/fixtures/getDocumentsFixture');

const MissingDocumentTypeError = require('../../../lib/errors/MissingDocumentTypeError');
const InvalidDocumentTypeError = require('../../../lib/errors/InvalidDocumentTypeError');
const InvalidDocumentIdError = require('../../../lib/errors/InvalidDocumentIdError');
const MismatchDocumentContractIdAndDataContractError = require('../../../lib/errors/MismatchDocumentContractIdAndDataContractError');

const generateDocumentId = require('../../../lib/document/generateDocumentId');

const {
  expectValidationError,
  expectJsonSchemaError,
} = require('../../../lib/test/expect/expectError');

const generateRandomId = require('../../../lib/test/utils/generateRandomId');

describe('validateDocumentFactory', () => {
  let dataContract;
  let rawDocuments;
  let rawDocument;
  let validateDocument;
  let validator;

  beforeEach(function beforeEach() {
    const ajv = new Ajv();

    validator = new JsonSchemaValidator(ajv);
    this.sinonSandbox.spy(validator, 'validate');

    dataContract = getDocumentsFixture.dataContract;

    validateDocument = validateDocumentFactory(
      validator,
      enrichDataContractWithBaseSchema,
    );

    const documents = getDocumentsFixture();
    rawDocuments = documents.map((o) => o.toJSON());
    [rawDocument] = rawDocuments;
  });

  describe('Base schema', () => {
    describe('$id', () => {
      it('should be present', () => {
        delete rawDocument.$id;

        const result = validateDocument(rawDocument, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('');
        expect(error.keyword).to.equal('required');
        expect(error.params.missingProperty).to.equal('$id');
      });

      it('should be a string', () => {
        rawDocument.$id = 1;

        const result = validateDocument(rawDocument, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.$id');
        expect(error.keyword).to.equal('type');
      });

      it('should be no less than 42 chars', () => {
        rawDocument.$id = '1'.repeat(41);

        const result = validateDocument(rawDocument, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.$id');
        expect(error.keyword).to.equal('minLength');
      });

      it('should be no longer than 44 chars', () => {
        rawDocument.$id = '1'.repeat(45);

        const result = validateDocument(rawDocument, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.$id');
        expect(error.keyword).to.equal('maxLength');
      });

      it('should be base58 encoded', () => {
        rawDocument.$id = '&'.repeat(44);

        const result = validateDocument(rawDocument, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.keyword).to.equal('pattern');
        expect(error.dataPath).to.equal('.$id');
      });
    });

    describe('$type', () => {
      it('should be present', () => {
        delete rawDocument.$type;

        const result = validateDocument(rawDocument, dataContract);

        expectValidationError(
          result,
          MissingDocumentTypeError,
        );

        const [error] = result.getErrors();

        expect(error.getRawDocument()).to.equal(rawDocument);
      });

      it('should be defined in Data Contract', () => {
        rawDocument.$type = 'undefinedDocument';

        const result = validateDocument(rawDocument, dataContract);

        expectValidationError(
          result,
          InvalidDocumentTypeError,
        );

        const [error] = result.getErrors();

        expect(error.getType()).to.equal('undefinedDocument');
      });

      it('should throw an error if getDocumentSchemaRef throws error', function it() {
        const someError = new Error();

        this.sinonSandbox.stub(dataContract, 'getDocumentSchemaRef').throws(someError);

        let error;
        try {
          validateDocument(rawDocument, dataContract);
        } catch (e) {
          error = e;
        }

        expect(error).to.equal(someError);

        expect(dataContract.getDocumentSchemaRef).to.have.been.calledOnce();
      });
    });

    describe('$rev', () => {
      it('should be present', () => {
        delete rawDocument.$rev;

        const result = validateDocument(rawDocument, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('');
        expect(error.keyword).to.equal('required');
        expect(error.params.missingProperty).to.equal('$rev');
      });

      it('should be a number', () => {
        rawDocument.$rev = 'string';

        const result = validateDocument(rawDocument, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.$rev');
        expect(error.keyword).to.equal('type');
      });

      it('should be an integer', () => {
        rawDocument.$rev = 1.1;

        const result = validateDocument(rawDocument, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.$rev');
        expect(error.keyword).to.equal('multipleOf');
      });

      it('should be greater or equal to one', () => {
        rawDocument.$rev = -1;

        const result = validateDocument(rawDocument, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.$rev');
        expect(error.keyword).to.equal('minimum');
      });
    });

    describe('$contractId', () => {
      it('should be present', () => {
        delete rawDocument.$contractId;

        const result = validateDocument(rawDocument, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('');
        expect(error.keyword).to.equal('required');
        expect(error.params.missingProperty).to.equal('$contractId');
      });

      it('should be a string', () => {
        rawDocument.$contractId = 1;

        const result = validateDocument(rawDocument, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.$contractId');
        expect(error.keyword).to.equal('type');
      });

      it('should be no less than 42 chars', () => {
        rawDocument.$contractId = '1'.repeat(41);

        const result = validateDocument(rawDocument, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.$contractId');
        expect(error.keyword).to.equal('minLength');
      });

      it('should be no longer than 44 chars', () => {
        rawDocument.$contractId = '1'.repeat(45);

        const result = validateDocument(rawDocument, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.$contractId');
        expect(error.keyword).to.equal('maxLength');
      });

      it('should be base58 encoded', () => {
        rawDocument.$contractId = '&'.repeat(44);

        const result = validateDocument(rawDocument, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.keyword).to.equal('pattern');
        expect(error.dataPath).to.equal('.$contractId');
      });
    });

    describe('$ownerId', () => {
      it('should be present', () => {
        delete rawDocument.$ownerId;

        const result = validateDocument(rawDocument, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('');
        expect(error.keyword).to.equal('required');
        expect(error.params.missingProperty).to.equal('$ownerId');
      });

      it('should be a string', () => {
        rawDocument.$ownerId = 1;

        const result = validateDocument(rawDocument, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.$ownerId');
        expect(error.keyword).to.equal('type');
      });

      it('should be no less than 42 chars', () => {
        rawDocument.$ownerId = '1'.repeat(41);

        const result = validateDocument(rawDocument, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.$ownerId');
        expect(error.keyword).to.equal('minLength');
      });

      it('should be no longer than 44 chars', () => {
        rawDocument.$ownerId = '1'.repeat(45);

        const result = validateDocument(rawDocument, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.$ownerId');
        expect(error.keyword).to.equal('maxLength');
      });

      it('should be base58 encoded', () => {
        rawDocument.$ownerId = '&'.repeat(44);

        const result = validateDocument(rawDocument, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.keyword).to.equal('pattern');
        expect(error.dataPath).to.equal('.$ownerId');
      });
    });
  });

  describe('Data Contract schema', () => {
    it('should return an error if the first document is not valid against Data Contract', () => {
      rawDocuments[0].name = 1;

      const result = validateDocument(rawDocuments[0], dataContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.name');
      expect(error.keyword).to.equal('type');
    });

    it('should return an error if the second document is not valid against Data Contract', () => {
      rawDocuments[1].undefined = 1;

      const result = validateDocument(rawDocuments[1], dataContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('');
      expect(error.keyword).to.equal('additionalProperties');
    });
  });

  it('should return invalid result if a document contractId is not equal to Data Contract ID', () => {
    rawDocument.$contractId = generateRandomId();

    const result = validateDocument(
      rawDocument,
      dataContract,
    );

    expectValidationError(result, MismatchDocumentContractIdAndDataContractError);

    const [error] = result.getErrors();

    expect(error.getDataContract()).to.equal(dataContract);
    expect(error.getRawDocument()).to.equal(rawDocument);
  });

  it('should return valid result is a document is valid', () => {
    const result = validateDocument(rawDocument, dataContract);

    expect(result).to.be.an.instanceOf(ValidationResult);
    expect(result.isValid()).to.be.true();
  });
});
