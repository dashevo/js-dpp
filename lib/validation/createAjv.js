const Ajv = require('ajv');

function createAjv() {
  return new Ajv({
    strictDefaults: true,
  });
}

module.exports = createAjv;
