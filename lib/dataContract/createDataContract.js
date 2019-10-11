const DataContract = require('./DataContract');

/**
 * @typedef createDataContract
 * @param {RawDataContract} rawDataContract
 * @return {DataContract}
 */
function createDataContract(rawDataContract) {
  const contract = new DataContract(
    rawDataContract.contractId,
    rawDataContract.documents,
  );

  if (rawDataContract.$schema) {
    contract.setJsonMetaSchema(rawDataContract.$schema);
  }

  if (rawDataContract.version) {
    contract.setVersion(rawDataContract.version);
  }

  if (rawDataContract.definitions) {
    contract.setDefinitions(rawDataContract.definitions);
  }

  return contract;
}

module.exports = createDataContract;
