const validateDataContractMaxDepthFactory = require('../../../../../lib/dataContract/stateTransition/validation/validateDataContractMaxDepthFactory');
const ValidationResult = require('../../../../../lib/validation/ValidationResult');
const { expectValidationError } = require('../../../../../lib/test/expect/expectError');
const DataContractMaxDepthExceedError = require('../../../../../lib/errors/DataContractMaxDepthExceedError');
const JsonSchemaError = require('../../../../../lib/errors/JsonSchemaError');

function generateDeepJson(depth) {
  const result = {};

  if (depth === 1) {
    return {
      depth,
    };
  }

  result[depth] = generateDeepJson(depth - 1);

  return result;
}

describe('validateDataContractMaxDepthFactory', () => {
  let refParserMock;
  let validateDataContractMaxDepth;
  let dataContractFixture;

  beforeEach(function beforeEach() {
    dataContractFixture = {};

    refParserMock = {
      dereference: this.sinonSandbox.stub(),
    };

    validateDataContractMaxDepth = validateDataContractMaxDepthFactory(refParserMock);
  });

  it('should throw error if depth > MAX_DEPTH', async () => {
    dataContractFixture = generateDeepJson(DataContractMaxDepthExceedError.MAX_DEPTH + 1);

    refParserMock.dereference.resolves(dataContractFixture);

    const result = await validateDataContractMaxDepth(dataContractFixture);

    expectValidationError(result);

    const [error] = result.getErrors();
    expect(error).to.be.an.instanceOf(DataContractMaxDepthExceedError);
    expect(error.message).to.equal(`Data Contract depth is greater than ${DataContractMaxDepthExceedError.MAX_DEPTH}`);
  });

  it('should return valid result if depth = MAX_DEPTH', async () => {
    dataContractFixture = generateDeepJson(DataContractMaxDepthExceedError.MAX_DEPTH);

    refParserMock.dereference.resolves(dataContractFixture);

    const result = await validateDataContractMaxDepth(dataContractFixture);

    expect(result).to.be.an.instanceOf(ValidationResult);
    expect(result.isValid()).to.be.true();
  });

  it('should throw error if contract contains array with depth > MAX_DEPTH', async () => {
    const deepJson = generateDeepJson(DataContractMaxDepthExceedError.MAX_DEPTH + 1);

    dataContractFixture = {
      array: [
        0, deepJson,
      ],
    };

    refParserMock.dereference.resolves(dataContractFixture);

    const result = await validateDataContractMaxDepth(dataContractFixture);

    expectValidationError(result);

    const [error] = result.getErrors();
    expect(error).to.be.an.instanceOf(DataContractMaxDepthExceedError);
    expect(error.message).to.equal(`Data Contract depth is greater than ${DataContractMaxDepthExceedError.MAX_DEPTH}`);
  });

  it('should return error if refParser throws an error', async () => {
    const refParserError = new Error('refParser error');

    refParserMock.dereference.throws(refParserError);

    const result = await validateDataContractMaxDepth(dataContractFixture);

    expectValidationError(result);
    const [error] = result.getErrors();

    expect(error).to.be.an.instanceOf(JsonSchemaError);
    expect(error.message).to.equal(refParserError.message);
  });

  it('should return valid result', async () => {
    refParserMock.dereference.resolves(dataContractFixture);

    const result = await validateDataContractMaxDepth(dataContractFixture);

    expect(result).to.be.an.instanceOf(ValidationResult);
    expect(result.isValid()).to.be.true();
    expect(result.getErrors()).to.be.an('Array');
    expect(result.getErrors()).to.be.empty();
  });
});
