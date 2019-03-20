const Contract = require('./Contract');

/**
 * @typedef createDPContract
 * @param {Object} rawDPContract
 * @return {Contract}
 */
function createDPContract(rawDPContract) {
  const dpContract = new Contract(
    rawDPContract.name,
    rawDPContract.documents,
  );

  if (rawDPContract.$schema) {
    dpContract.setJsonMetaSchema(rawDPContract.$schema);
  }

  if (rawDPContract.version) {
    dpContract.setVersion(rawDPContract.version);
  }

  if (rawDPContract.definitions) {
    dpContract.setDefinitions(rawDPContract.definitions);
  }

  return dpContract;
}

module.exports = createDPContract;
