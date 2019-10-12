const Ajv = require('ajv');

const JsonSchemaValidator = require('../../../lib/validation/JsonSchemaValidator');
const ValidationResult = require('../../../lib/validation/ValidationResult');

const Document = require('../../../lib/document/Document');
const validateDocumentFactory = require('../../../lib/document/validateDocumentFactory');
const enrichDataContractWithBaseDocument = require('../../../lib/document/enrichDataContractWithBaseDocument');

const getDataContractFixture = require('../../../lib/test/fixtures/getDataContractFixture');
const getDocumentsFixture = require('../../../lib/test/fixtures/getDocumentsFixture');

const MissingDocumentTypeError = require('../../../lib/errors/MissingDocumentTypeError');
const MissingDocumentActionError = require('../../../lib/errors/MissingDocumentActionError');
const InvalidDocumentTypeError = require('../../../lib/errors/InvalidDocumentTypeError');
const InvalidDocumentEntropyError = require('../../../lib/errors/InvalidDocumentEntropyError');
const ConsensusError = require('../../../lib/errors/ConsensusError');
const JsonSchemaError = require('../../../lib/errors/JsonSchemaError');

const originalDocumentBaseSchema = require('../../../schema/base/document');

const {
  expectValidationError,
  expectJsonSchemaError,
} = require('../../../lib/test/expect/expectError');

describe('validateDocumentFactory', () => {
  let dataContract;
  let rawDocuments;
  let rawDocument;
  let validateDocument;
  let validator;
  let documentBaseSchema;

  beforeEach(function beforeEach() {
    const ajv = new Ajv();

    validator = new JsonSchemaValidator(ajv);
    this.sinonSandbox.spy(validator, 'validate');

    dataContract = getDataContractFixture();

    validateDocument = validateDocumentFactory(
      validator,
      enrichDataContractWithBaseDocument,
    );

    rawDocuments = getDocumentsFixture().map(o => o.toJSON());
    [rawDocument] = rawDocuments;

    documentBaseSchema = JSON.parse(
      JSON.stringify(originalDocumentBaseSchema),
    );
  });

  describe('Base schema', () => {
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

    describe('$action', () => {
      it('should be present', () => {
        delete rawDocument.$action;

        const result = validateDocument(rawDocument, dataContract);

        expectValidationError(
          result,
          MissingDocumentActionError,
        );

        const [error] = result.getErrors();

        expect(error.getRawDocument()).to.equal(rawDocument);
      });

      it('should be a number', () => {
        rawDocument.$action = 'string';

        const result = validateDocument(rawDocument, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.$action');
        expect(error.keyword).to.equal('type');
      });

      it('should be defined enum', () => {
        rawDocument.$action = 3;

        const result = validateDocument(rawDocument, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.$action');
        expect(error.keyword).to.equal('enum');
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

      it('should be no less than 64 chars', () => {
        rawDocument.$contractId = '86b273ff';

        const result = validateDocument(rawDocument, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.$contractId');
        expect(error.keyword).to.equal('minLength');
      });

      it('should be no longer than 64 chars', () => {
        rawDocument.$contractId = '86b273ff86b273ff86b273ff86b273ff86b273ff86b273ff86b273ff86b273ff86b273ff86b273ff86b273ff86b273ff86b273ff';

        const result = validateDocument(rawDocument, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.$contractId');
        expect(error.keyword).to.equal('maxLength');
      });
    });

    describe('$userId', () => {
      it('should be present', () => {
        delete rawDocument.$userId;

        const result = validateDocument(rawDocument, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('');
        expect(error.keyword).to.equal('required');
        expect(error.params.missingProperty).to.equal('$userId');
      });

      it('should be a string', () => {
        rawDocument.$userId = 1;

        const result = validateDocument(rawDocument, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.$userId');
        expect(error.keyword).to.equal('type');
      });

      it('should be no less than 64 chars', () => {
        rawDocument.$userId = '86b273ff';

        const result = validateDocument(rawDocument, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.$userId');
        expect(error.keyword).to.equal('minLength');
      });

      it('should be no longer than 64 chars', () => {
        rawDocument.$userId = '86b273ff86b273ff86b273ff86b273ff86b273ff86b273ff86b273ff86b273ff86b273ff86b273ff86b273ff86b273ff86b273ff';

        const result = validateDocument(rawDocument, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.$userId');
        expect(error.keyword).to.equal('maxLength');
      });
    });

    describe('$entropy', () => {
      it('should be present', () => {
        delete rawDocument.$entropy;

        const result = validateDocument(rawDocument, dataContract);

        expectValidationError(result, ConsensusError, 2);

        const [jsonError, entropyError] = result.getErrors();

        expect(jsonError).to.be.an.instanceOf(JsonSchemaError);
        expect(jsonError.dataPath).to.equal('');
        expect(jsonError.keyword).to.equal('required');
        expect(jsonError.params.missingProperty).to.equal('$entropy');

        expect(entropyError).to.be.an.instanceOf(InvalidDocumentEntropyError);
        expect(entropyError.getRawDocument()).to.equal(rawDocument);
      });

      it('should be a string', () => {
        rawDocument.$entropy = 1;

        const result = validateDocument(rawDocument, dataContract);

        expectValidationError(result, ConsensusError, 2);

        const [jsonError, entropyError] = result.getErrors();

        expect(jsonError).to.be.an.instanceOf(JsonSchemaError);
        expect(jsonError.dataPath).to.equal('.$entropy');
        expect(jsonError.keyword).to.equal('type');

        expect(entropyError).to.be.an.instanceOf(InvalidDocumentEntropyError);
        expect(entropyError.getRawDocument()).to.equal(rawDocument);
      });

      it('should be no less than 34 chars', () => {
        rawDocument.$entropy = '86b273ff';

        const result = validateDocument(rawDocument, dataContract);

        expectValidationError(result, ConsensusError, 2);

        const [jsonError, entropyError] = result.getErrors();

        expect(jsonError).to.be.an.instanceOf(JsonSchemaError);
        expect(jsonError.dataPath).to.equal('.$entropy');
        expect(jsonError.keyword).to.equal('minLength');

        expect(entropyError).to.be.an.instanceOf(InvalidDocumentEntropyError);
        expect(entropyError.getRawDocument()).to.equal(rawDocument);
      });

      it('should be no longer than 34 chars', () => {
        rawDocument.$entropy = '86b273ff86b273ff86b273ff86b273ff86b273ff86b273ff';

        const result = validateDocument(rawDocument, dataContract);

        expectValidationError(result, ConsensusError, 2);

        const [jsonError, entropyError] = result.getErrors();

        expect(jsonError).to.be.an.instanceOf(JsonSchemaError);
        expect(jsonError.dataPath).to.equal('.$entropy');
        expect(jsonError.keyword).to.equal('maxLength');

        expect(entropyError).to.be.an.instanceOf(InvalidDocumentEntropyError);
        expect(entropyError.getRawDocument()).to.equal(rawDocument);
      });

      it('should be valid entropy', () => {
        rawDocument.$entropy = '86b273ff86b273ff86b273ff86b273ff86';

        const result = validateDocument(rawDocument, dataContract);

        expectValidationError(result, InvalidDocumentEntropyError);

        const [error] = result.getErrors();

        expect(error).to.be.an.instanceOf(InvalidDocumentEntropyError);
        expect(error.getRawDocument()).to.equal(rawDocument);
      });
    });

    describe('$meta', () => {
      it('should not be required', () => {
        delete rawDocument.$meta;

        const result = validateDocument(rawDocument, dataContract);

        expectJsonSchemaError(result, 0);
      });

      it('should not have additional properties', () => {
        rawDocument.$meta.test = 1;

        const result = validateDocument(rawDocument, dataContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.$meta');
        expect(error.keyword).to.equal('additionalProperties');
      });

      describe('userId', () => {
        it('should be present', () => {
          delete rawDocument.$meta.userId;

          const result = validateDocument(rawDocument, dataContract);

          expectJsonSchemaError(result);

          const [error] = result.getErrors();

          expect(error.dataPath).to.equal('.$meta');
          expect(error.keyword).to.equal('required');
          expect(error.params.missingProperty).to.equal('userId');
        });

        it('should be a string', () => {
          rawDocument.$meta.userId = 1;

          const result = validateDocument(rawDocument, dataContract);

          expectJsonSchemaError(result);

          const [error] = result.getErrors();

          expect(error.dataPath).to.equal('.$meta.userId');
          expect(error.keyword).to.equal('type');
        });

        it('should be no less than 64 chars', () => {
          rawDocument.$meta.userId = '86b273ff';

          const result = validateDocument(rawDocument, dataContract);

          expectJsonSchemaError(result);

          const [error] = result.getErrors();

          expect(error.dataPath).to.equal('.$meta.userId');
          expect(error.keyword).to.equal('minLength');
        });

        it('should be no longer than 64 chars', () => {
          rawDocument.$meta.userId = '86b273ff86b273ff86b273ff86b273ff86b273ff86b273ff86b273ff86b273ff86b273ff86b273ff86b273ff86b273ff86b273ff';

          const result = validateDocument(rawDocument, dataContract);

          expectJsonSchemaError(result);

          const [error] = result.getErrors();

          expect(error.dataPath).to.equal('.$meta.userId');
          expect(error.keyword).to.equal('maxLength');
        });
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

  it('should validate against base Document schema if $action is DELETE', () => {
    delete rawDocument.name;
    rawDocument.$action = Document.ACTIONS.DELETE;

    const result = validateDocument(rawDocument, dataContract);

    expect(validator.validate).to.have.been.calledOnceWith(documentBaseSchema, rawDocument);
    expect(result.getErrors().length).to.equal(0);
  });

  it('should throw validation error if additional fields are defined and $action is DELETE', () => {
    rawDocument.$action = Document.ACTIONS.DELETE;

    const result = validateDocument(rawDocument, dataContract);

    const [error] = result.getErrors();

    expect(error.dataPath).to.equal('');
    expect(error.keyword).to.equal('additionalProperties');
  });

  it('should throw validation error if allowMeta is false while $meta is set', () => {
    rawDocument.$meta = {};

    const result = validateDocument(rawDocument, dataContract, { allowMeta: false });

    const [error] = result.getErrors();

    expect(error.dataPath).to.equal('');
    expect(error.keyword).to.equal('additionalProperties');
  });

  it('should return valid response is a document is valid', () => {
    const result = validateDocument(rawDocument, dataContract);

    expect(result).to.be.an.instanceOf(ValidationResult);
    expect(result.isValid()).to.be.true();
  });
});
