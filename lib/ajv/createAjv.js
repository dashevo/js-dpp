const Ajv = require('ajv').default;

const addFormats = require('ajv-formats');

const Re2 = require('re2');
const codegen = require('ajv/dist/compile/codegen');
const code = require('ajv/dist/vocabularies/code');
const addByteArrayKeyword = require('./keywords/byteArray/addByteArrayKeyword');

function replaceRegExpWithRe2() {
  global.Re2 = Re2;

  code.usePattern = function usePattern(gen, pattern) {
    return gen.scopeValue('pattern', {
      key: pattern,
      ref: new Re2(pattern, 'u'),
      code: codegen._`new Re2(${pattern}, "u")`,
    });
  };
}

replaceRegExpWithRe2();

/**
 * @return {ajv.Ajv}
 */
function createAjv() {
  const ajv = new Ajv({
    strictTypes: true,
    strictTuples: true,
    strictRequired: true,
    addUsedSchema: false,
    strict: true,
  });

  ajv.addVocabulary([
    'ownerId',
    'documents',
    'protocolVersion',
    'indices',
    '$commit',
  ]);

  addFormats(ajv, { mode: 'fast' });

  addByteArrayKeyword(ajv);

  return ajv;
}

module.exports = createAjv;
