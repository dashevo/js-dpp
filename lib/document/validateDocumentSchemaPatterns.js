const Re2 = require('re2');
const traverse = require('json-schema-traverse');
const ValidationResult = require('../validation/ValidationResult');
const IncompatibleRe2PatternError = require('./errors/IncompatibleRe2PatternError');

/**
 * @typedef validateDocumentSchemaPatterns
 * @param {Object} documentSchema
 * @returns {ValidationResult}
 */
function validateDocumentSchemaPatterns(documentSchema) {
  const result = new ValidationResult();

  traverse(documentSchema, (item, path) => {
    Object.entries(item).forEach(([key, value]) => {
      if (key === 'pattern') {
        try {
          // eslint-disable-next-line no-new
          new Re2(value);
        } catch (e) {
          result.addError(new IncompatibleRe2PatternError(value, path, e.message));
        }
      }
    });
  });

  return result;
}

module.exports = validateDocumentSchemaPatterns;
