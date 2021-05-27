const Ajv = require('ajv').default;

const addFormats = require('ajv-formats');
const addByteArrayKeyword = require('./keywords/byteArray/addByteArrayKeyword');

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
