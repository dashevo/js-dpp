const Ajv = require('ajv');

const JsonSchemaValidator = require('../../../lib/validation/JsonSchemaValidator');
const ValidationResult = require('../../../lib/validation/ValidationResult');

const DataContract = require('../../../lib/dataContract/DataContract');

const validateDocumentFactory = require('../../../lib/document/validateDocumentFactory');
const enrichDataContractWithBaseSchema = require('../../../lib/dataContract/enrichDataContractWithBaseSchema');

const getDataContractFixture = require('../../../lib/test/fixtures/getDataContractFixture');
const getDocumentsFixture = require('../../../lib/test/fixtures/getDocumentsFixture');

const MissingDocumentTypeError = require('../../../lib/errors/MissingDocumentTypeError');
const InvalidDocumentTypeError = require('../../../lib/errors/InvalidDocumentTypeError');
const MismatchDocumentContractIdAndDataContractError = require('../../../lib/errors/MismatchDocumentContractIdAndDataContractError');

const EncodedBuffer = require('../../../lib/util/encoding/EncodedBuffer');

const {
  expectValidationError,
  expectJsonSchemaError,
} = require('../../../lib/test/expect/expectError');

const generateRandomId = require('../../../lib/test/utils/generateRandomId');

describe('validateDocumentFactory', () => {
  let dataContract;
  let rawDocuments;
  let jsonDocument;
  let document;
  let documents;
  let validateDocument;
  let validator;

  beforeEach(function beforeEach() {
    const ajv = new Ajv();

    validator = new JsonSchemaValidator(ajv);
    this.sinonSandbox.spy(validator, 'validate');

    dataContract = getDataContractFixture();

    validateDocument = validateDocumentFactory(
      validator,
      enrichDataContractWithBaseSchema,
    );

    documents = getDocumentsFixture(dataContract);
    rawDocuments = documents.map((o) => o.toJSON());
    [jsonDocument] = rawDocuments;

    document = documents;
    document.toJSON = this.sinonSandbox.stub().returns(jsonDocument);
  });

  describe('Base schema', () => {
    describe('$protocolVersion', () => {
      it('should be present', () => {
        delete jsonDocument.$protocolVersion;

        const result = validateDocument(document, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('');
        expect(error.keyword).to.equal('required');
        expect(error.params.missingProperty).to.equal('$protocolVersion');
      });

      it('should be an integer', () => {
        jsonDocument.$protocolVersion = '1';

        const result = validateDocument(document, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.$protocolVersion');
        expect(error.keyword).to.equal('type');
      });

      it('should not be less than 0', () => {
        jsonDocument.$protocolVersion = -1;

        const result = validateDocument(document, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.$protocolVersion');
        expect(error.keyword).to.equal('minimum');
      });

      it('should not be greater than current Document protocol version (0)', () => {
        jsonDocument.$protocolVersion = 1;

        const result = validateDocument(document, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.$protocolVersion');
        expect(error.keyword).to.equal('maximum');
      });

      it('should be base58 encoded', () => {
        jsonDocument.$id = '&'.repeat(44);

        const result = validateDocument(document, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.keyword).to.equal('pattern');
        expect(error.dataPath).to.equal('.$id');
      });
    });

    describe('$id', () => {
      it('should be present', () => {
        delete jsonDocument.$id;

        const result = validateDocument(document, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('');
        expect(error.keyword).to.equal('required');
        expect(error.params.missingProperty).to.equal('$id');
      });

      it('should be a string', () => {
        jsonDocument.$id = 1;

        const result = validateDocument(document, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.$id');
        expect(error.keyword).to.equal('type');
      });

      it('should be no less than 42 chars', () => {
        jsonDocument.$id = '1'.repeat(41);

        const result = validateDocument(document, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.$id');
        expect(error.keyword).to.equal('minLength');
      });

      it('should be no longer than 44 chars', () => {
        jsonDocument.$id = '1'.repeat(45);

        const result = validateDocument(document, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.$id');
        expect(error.keyword).to.equal('maxLength');
      });

      it('should be base58 encoded', () => {
        jsonDocument.$id = '&'.repeat(44);

        const result = validateDocument(document, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.keyword).to.equal('pattern');
        expect(error.dataPath).to.equal('.$id');
      });
    });

    describe('$type', () => {
      it('should be present', () => {
        delete jsonDocument.$type;

        const result = validateDocument(document, dataContract);

        expectValidationError(
          result,
          MissingDocumentTypeError,
        );

        const [error] = result.getErrors();

        expect(error.getRawDocument()).to.equal(jsonDocument);
      });

      it('should be defined in Data Contract', () => {
        jsonDocument.$type = 'undefinedDocument';

        const result = validateDocument(document, dataContract);

        expectValidationError(
          result,
          InvalidDocumentTypeError,
        );

        const [error] = result.getErrors();

        expect(error.getType()).to.equal('undefinedDocument');
      });

      it('should throw an error if getDocumentSchemaRef throws error', function it() {
        const someError = new Error();

        this.sinonSandbox.stub(DataContract.prototype, 'getDocumentSchemaRef').throws(someError);

        let error;
        try {
          validateDocument(document, dataContract);
        } catch (e) {
          error = e;
        }

        expect(error).to.equal(someError);

        expect(dataContract.getDocumentSchemaRef).to.have.been.calledOnce();
      });
    });

    describe('$revision', () => {
      it('should be present', () => {
        delete jsonDocument.$revision;

        const result = validateDocument(document, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('');
        expect(error.keyword).to.equal('required');
        expect(error.params.missingProperty).to.equal('$revision');
      });

      it('should be a number', () => {
        jsonDocument.$revision = 'string';

        const result = validateDocument(document, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.$revision');
        expect(error.keyword).to.equal('type');
      });

      it('should be an integer', () => {
        jsonDocument.$revision = 1.1;

        const result = validateDocument(document, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.$revision');
        expect(error.keyword).to.equal('type');
      });

      it('should be greater or equal to one', () => {
        jsonDocument.$revision = -1;

        const result = validateDocument(document, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.$revision');
        expect(error.keyword).to.equal('minimum');
      });
    });

    describe('$dataContractId', () => {
      it('should be present', () => {
        delete jsonDocument.$dataContractId;

        const result = validateDocument(document, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('');
        expect(error.keyword).to.equal('required');
        expect(error.params.missingProperty).to.equal('$dataContractId');
      });

      it('should be a string', () => {
        jsonDocument.$dataContractId = 1;

        const result = validateDocument(document, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.$dataContractId');
        expect(error.keyword).to.equal('type');
      });

      it('should be no less than 42 chars', () => {
        jsonDocument.$dataContractId = '1'.repeat(41);

        const result = validateDocument(document, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.$dataContractId');
        expect(error.keyword).to.equal('minLength');
      });

      it('should be no longer than 44 chars', () => {
        jsonDocument.$dataContractId = '1'.repeat(45);

        const result = validateDocument(document, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.$dataContractId');
        expect(error.keyword).to.equal('maxLength');
      });

      it('should be base58 encoded', () => {
        jsonDocument.$dataContractId = '&'.repeat(44);

        const result = validateDocument(document, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.keyword).to.equal('pattern');
        expect(error.dataPath).to.equal('.$dataContractId');
      });
    });

    describe('$ownerId', () => {
      it('should be present', () => {
        delete jsonDocument.$ownerId;

        const result = validateDocument(document, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('');
        expect(error.keyword).to.equal('required');
        expect(error.params.missingProperty).to.equal('$ownerId');
      });

      it('should be a string', () => {
        jsonDocument.$ownerId = 1;

        const result = validateDocument(document, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.$ownerId');
        expect(error.keyword).to.equal('type');
      });

      it('should be no less than 42 chars', () => {
        jsonDocument.$ownerId = '1'.repeat(41);

        const result = validateDocument(document, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.$ownerId');
        expect(error.keyword).to.equal('minLength');
      });

      it('should be no longer than 44 chars', () => {
        jsonDocument.$ownerId = '1'.repeat(45);

        const result = validateDocument(document, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.$ownerId');
        expect(error.keyword).to.equal('maxLength');
      });

      it('should be base58 encoded', () => {
        jsonDocument.$ownerId = '&'.repeat(44);

        const result = validateDocument(document, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.keyword).to.equal('pattern');
        expect(error.dataPath).to.equal('.$ownerId');
      });
    });
  });

  describe('Data Contract schema', () => {
    it('should return an error if the first document is not valid against Data Contract', () => {
      jsonDocument.name = 1;

      const result = validateDocument(document, dataContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.name');
      expect(error.keyword).to.equal('type');
    });

    it('should return an error if the second document is not valid against Data Contract', function it() {
      // eslint-disable-next-line prefer-destructuring
      document = documents[1];

      // eslint-disable-next-line prefer-destructuring
      jsonDocument = rawDocuments[1];
      jsonDocument.undefined = 1;

      document.toJSON = this.sinonSandbox.stub().returns(jsonDocument);

      const result = validateDocument(document, dataContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('');
      expect(error.keyword).to.equal('additionalProperties');
    });
  });

  it('should return invalid result if a document contractId is not equal to Data Contract ID', () => {
    jsonDocument.$dataContractId = generateRandomId().toString();

    const result = validateDocument(
      document,
      dataContract,
    );

    expectValidationError(result, MismatchDocumentContractIdAndDataContractError);

    const [error] = result.getErrors();

    expect(error.getDataContract()).to.equal(dataContract);
    expect(error.getRawDocument()).to.equal(jsonDocument);
  });

  it('return invalid result if binary field exceeds `maxLength`', () => {
    // eslint-disable-next-line prefer-destructuring
    document = getDocumentsFixture(dataContract)[8];

    document.data.base64Field = new EncodedBuffer(Buffer.alloc(32), 'base64');

    jsonDocument = document.toJSON();

    const result = validateDocument(document, dataContract);

    expectJsonSchemaError(result);

    const [error] = result.getErrors();

    expect(error.dataPath).to.equal('.base64Field');
    expect(error.keyword).to.equal('maxLength');
  });

  it('should return valid result is a document is valid', () => {
    const result = validateDocument(document, dataContract);

    expect(result).to.be.an.instanceOf(ValidationResult);
    expect(result.isValid()).to.be.true();
  });
});
