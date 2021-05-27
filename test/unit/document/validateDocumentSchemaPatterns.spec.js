const validateDocumentSchemaPatterns = require('../../../lib/document/validateDocumentSchemaPatterns');
const { expectValidationError } = require(
  '../../../lib/test/expect/expectError',
);
const IncompatibleRe2PatternError = require('../../../lib/document/errors/IncompatibleRe2PatternError');

describe('validateDocumentSchemaPatterns', () => {
  it('should return valid result', () => {
    const schema = {
      type: 'object',
      properties: {
        foo: { type: 'integer' },
        bar: {
          type: 'string',
          pattern: '([a-z]+)+$',
        },
      },
      required: ['foo'],
      additionalProperties: false,
    };

    const result = validateDocumentSchemaPatterns(schema);

    expect(result.isValid()).to.be.true();
  });

  it('should return invalid result on incompatible pattern', () => {
    const schema = {
      type: 'object',
      properties: {
        foo: { type: 'integer' },
        bar: {
          type: 'string',
          pattern: '^((?!-|_)[a-zA-Z0-9-_]{0,62}[a-zA-Z0-9])$',
        },
      },
      required: ['foo'],
      additionalProperties: false,
    };

    const result = validateDocumentSchemaPatterns(schema);

    expectValidationError(result, IncompatibleRe2PatternError);
    const [error] = result.getErrors();

    expect(error.getPattern()).to.equal('^((?!-|_)[a-zA-Z0-9-_]{0,62}[a-zA-Z0-9])$');
    expect(error.getPath()).to.equal('/properties/bar');
    expect(error.getOriginalErrorMessage()).to.equal('invalid perl operator: (?!');
  });
});
