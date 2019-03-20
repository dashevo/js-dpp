const Contract = require('./Contract');

/**
 * @typedef createContract
 * @param {Object} rawContract
 * @return {Contract}
 */
function createContract(rawContract) {
  const dpContract = new Contract(
    rawContract.name,
    rawContract.documents,
  );

  if (rawContract.$schema) {
    dpContract.setJsonMetaSchema(rawContract.$schema);
  }

  if (rawContract.version) {
    dpContract.setVersion(rawContract.version);
  }

  if (rawContract.definitions) {
    dpContract.setDefinitions(rawContract.definitions);
  }

  return dpContract;
}

module.exports = createContract;
