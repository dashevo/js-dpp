const RE2 = require('re2');
const codegen = require('ajv/dist/compile/codegen');
const code = require('ajv/dist/vocabularies/code');

function injectRE2() {
  global.RE2 = RE2;

  code.usePattern = function usePattern(gen, pattern) {
    return gen.scopeValue('pattern', {
      key: pattern,
      ref: new RE2(pattern, 'u'),
      code: codegen._`new RE2(${pattern}, "u")`,
    });
  };
}

module.exports = injectRE2;
