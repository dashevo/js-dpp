const Ajv = require('ajv');

const JsonSchemaValidator = require('../../../lib/validation/JsonSchemaValidator');
const ValidationResult = require('../../../lib/validation/ValidationResult');

const Document = require('../../../lib/document/Document');
const validateDPObjectFactory = require('../../../lib/document/validateDPObjectFactory');
const enrichDPContractWithBaseDPObject = require('../../../lib/document/enrichDPContractWithBaseDPObject');

const getDPContractFixture = require('../../../lib/test/fixtures/getDPContractFixture');
const getDPObjectsFixture = require('../../../lib/test/fixtures/getDPObjectsFixture');

const MissingDPObjectTypeError = require('../../../lib/errors/MissingDPObjectTypeError');
const MissingDPObjectActionError = require('../../../lib/errors/MissingDPObjectActionError');
const InvalidDPObjectTypeError = require('../../../lib/errors/InvalidDPObjectTypeError');
const InvalidDPObjectScopeIdError = require('../../../lib/errors/InvalidDPObjectScopeIdError');
const ConsensusError = require('../../../lib/errors/ConsensusError');
const JsonSchemaError = require('../../../lib/errors/JsonSchemaError');

const originalDPObjectBaseSchema = require('../../../schema/base/dp-object');

const {
  expectValidationError,
  expectJsonSchemaError,
} = require('../../../lib/test/expect/expectError');

describe('validateDPObjectFactory', () => {
  let dpContract;
  let rawDocuments;
  let rawDocument;
  let validateDPObject;
  let validator;
  let dpObjectBaseSchema;

  beforeEach(function beforeEach() {
    const ajv = new Ajv();

    validator = new JsonSchemaValidator(ajv);
    this.sinonSandbox.spy(validator, 'validate');

    dpContract = getDPContractFixture();

    validateDPObject = validateDPObjectFactory(
      validator,
      enrichDPContractWithBaseDPObject,
    );

    rawDocuments = getDPObjectsFixture().map(o => o.toJSON());
    [rawDocument] = rawDocuments;

    dpObjectBaseSchema = JSON.parse(
      JSON.stringify(originalDPObjectBaseSchema),
    );
  });

  describe('Base schema', () => {
    describe('$type', () => {
      it('should be present', () => {
        delete rawDocument.$type;

        const result = validateDPObject(rawDocument, dpContract);

        expectValidationError(
          result,
          MissingDPObjectTypeError,
        );

        const [error] = result.getErrors();

        expect(error.getRawDocument()).to.equal(rawDocument);
      });

      it('should be defined in DP Contract', () => {
        rawDocument.$type = 'undefinedObject';

        const result = validateDPObject(rawDocument, dpContract);

        expectValidationError(
          result,
          InvalidDPObjectTypeError,
        );

        const [error] = result.getErrors();

        expect(error.getType()).to.equal('undefinedObject');
      });

      it('should throw an error if getDPObjectSchemaRef throws error', function it() {
        const someError = new Error();

        this.sinonSandbox.stub(dpContract, 'getDPObjectSchemaRef').throws(someError);

        let error;
        try {
          validateDPObject(rawDocument, dpContract);
        } catch (e) {
          error = e;
        }

        expect(error).to.equal(someError);

        expect(dpContract.getDPObjectSchemaRef).to.have.been.calledOnce();
      });
    });

    describe('$action', () => {
      it('should be present', () => {
        delete rawDocument.$action;

        const result = validateDPObject(rawDocument, dpContract);

        expectValidationError(
          result,
          MissingDPObjectActionError,
        );

        const [error] = result.getErrors();

        expect(error.getRawDocument()).to.equal(rawDocument);
      });

      it('should be a number', () => {
        rawDocument.$action = 'string';

        const result = validateDPObject(rawDocument, dpContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.$action');
        expect(error.keyword).to.equal('type');
      });

      it('should be defined enum', () => {
        rawDocument.$action = 3;

        const result = validateDPObject(rawDocument, dpContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.$action');
        expect(error.keyword).to.equal('enum');
      });
    });

    describe('$rev', () => {
      it('should return an error if $rev is not present', () => {
        delete rawDocument.$rev;

        const result = validateDPObject(rawDocument, dpContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('');
        expect(error.keyword).to.equal('required');
        expect(error.params.missingProperty).to.equal('$rev');
      });

      it('should be a number', () => {
        rawDocument.$rev = 'string';

        const result = validateDPObject(rawDocument, dpContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.$rev');
        expect(error.keyword).to.equal('type');
      });

      it('should be an integer', () => {
        rawDocument.$rev = 1.1;

        const result = validateDPObject(rawDocument, dpContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.$rev');
        expect(error.keyword).to.equal('multipleOf');
      });

      it('should be greater or equal to zero', () => {
        rawDocument.$rev = -1;

        const result = validateDPObject(rawDocument, dpContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.$rev');
        expect(error.keyword).to.equal('minimum');
      });
    });

    describe('$scope', () => {
      it('should be present', () => {
        delete rawDocument.$scope;

        const result = validateDPObject(rawDocument, dpContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('');
        expect(error.keyword).to.equal('required');
        expect(error.params.missingProperty).to.equal('$scope');
      });

      it('should be a string', () => {
        rawDocument.$scope = 1;

        const result = validateDPObject(rawDocument, dpContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.$scope');
        expect(error.keyword).to.equal('type');
      });

      it('should be no less than 64 chars', () => {
        rawDocument.$scope = '86b273ff';

        const result = validateDPObject(rawDocument, dpContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.$scope');
        expect(error.keyword).to.equal('minLength');
      });

      it('should be no longer than 64 chars', () => {
        rawDocument.$scope = '86b273ff86b273ff86b273ff86b273ff86b273ff86b273ff86b273ff86b273ff86b273ff86b273ff86b273ff86b273ff86b273ff';

        const result = validateDPObject(rawDocument, dpContract);

        expectJsonSchemaError(result);

        const [error] = result.getErrors();

        expect(error.dataPath).to.equal('.$scope');
        expect(error.keyword).to.equal('maxLength');
      });
    });

    describe('$scopeId', () => {
      it('should be present', () => {
        delete rawDocument.$scopeId;

        const result = validateDPObject(rawDocument, dpContract);

        expectValidationError(result, ConsensusError, 2);

        const [jsonError, scopeError] = result.getErrors();

        expect(jsonError).to.be.an.instanceOf(JsonSchemaError);
        expect(jsonError.dataPath).to.equal('');
        expect(jsonError.keyword).to.equal('required');
        expect(jsonError.params.missingProperty).to.equal('$scopeId');

        expect(scopeError).to.be.an.instanceOf(InvalidDPObjectScopeIdError);
        expect(scopeError.getRawDocument()).to.equal(rawDocument);
      });

      it('should be a string', () => {
        rawDocument.$scopeId = 1;

        const result = validateDPObject(rawDocument, dpContract);

        expectValidationError(result, ConsensusError, 2);

        const [jsonError, scopeError] = result.getErrors();

        expect(jsonError).to.be.an.instanceOf(JsonSchemaError);
        expect(jsonError.dataPath).to.equal('.$scopeId');
        expect(jsonError.keyword).to.equal('type');

        expect(scopeError).to.be.an.instanceOf(InvalidDPObjectScopeIdError);
        expect(scopeError.getRawDocument()).to.equal(rawDocument);
      });

      it('should be no less than 34 chars', () => {
        rawDocument.$scopeId = '86b273ff';

        const result = validateDPObject(rawDocument, dpContract);

        expectValidationError(result, ConsensusError, 2);

        const [jsonError, scopeError] = result.getErrors();

        expect(jsonError).to.be.an.instanceOf(JsonSchemaError);
        expect(jsonError.dataPath).to.equal('.$scopeId');
        expect(jsonError.keyword).to.equal('minLength');

        expect(scopeError).to.be.an.instanceOf(InvalidDPObjectScopeIdError);
        expect(scopeError.getRawDocument()).to.equal(rawDocument);
      });

      it('should be no longer than 34 chars', () => {
        rawDocument.$scopeId = '86b273ff86b273ff86b273ff86b273ff86b273ff86b273ff';

        const result = validateDPObject(rawDocument, dpContract);

        expectValidationError(result, ConsensusError, 2);

        const [jsonError, scopeError] = result.getErrors();

        expect(jsonError).to.be.an.instanceOf(JsonSchemaError);
        expect(jsonError.dataPath).to.equal('.$scopeId');
        expect(jsonError.keyword).to.equal('maxLength');

        expect(scopeError).to.be.an.instanceOf(InvalidDPObjectScopeIdError);
        expect(scopeError.getRawDocument()).to.equal(rawDocument);
      });

      it('should be valid entropy', () => {
        rawDocument.$scopeId = '86b273ff86b273ff86b273ff86b273ff86';

        const result = validateDPObject(rawDocument, dpContract);

        expectValidationError(result, InvalidDPObjectScopeIdError);

        const [error] = result.getErrors();

        expect(error).to.be.an.instanceOf(InvalidDPObjectScopeIdError);
        expect(error.getRawDocument()).to.equal(rawDocument);
      });
    });
  });

  describe('DP Contract schema', () => {
    it('should return an error if the first object is not valid against DP Contract', () => {
      rawDocuments[0].name = 1;

      const result = validateDPObject(rawDocuments[0], dpContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('.name');
      expect(error.keyword).to.equal('type');
    });

    it('should return an error if the second object is not valid against DP Contract', () => {
      rawDocuments[1].undefined = 1;

      const result = validateDPObject(rawDocuments[1], dpContract);

      expectJsonSchemaError(result);

      const [error] = result.getErrors();

      expect(error.dataPath).to.equal('');
      expect(error.keyword).to.equal('additionalProperties');
    });
  });

  it('should validate against base DP object schema if $action is DELETE', () => {
    delete rawDocument.name;
    rawDocument.$action = Document.ACTIONS.DELETE;

    const result = validateDPObject(rawDocument, dpContract);

    expect(validator.validate).to.have.been.calledOnceWith(dpObjectBaseSchema, rawDocument);
    expect(result.getErrors().length).to.equal(0);
  });

  it('should throw validation error if additional fields are defined and $action is DELETE', () => {
    rawDocument.$action = Document.ACTIONS.DELETE;

    const result = validateDPObject(rawDocument, dpContract);

    const [error] = result.getErrors();

    expect(error.dataPath).to.equal('');
    expect(error.keyword).to.equal('additionalProperties');
  });

  it('should return valid response is an object is valid', () => {
    const result = validateDPObject(rawDocument, dpContract);

    expect(result).to.be.an.instanceOf(ValidationResult);
    expect(result.isValid()).to.be.true();
  });
});
