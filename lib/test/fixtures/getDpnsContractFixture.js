const dpnsDocuments = require('@dashevo/dpns-contract/src/schema/dpns-documents');
const DataContract = require('../../dataContract/DataContract');

/**
 * @return {DataContract}
 */
module.exports = function getDataContractFixture() {
  return new DataContract('HJsMdhDXQqaFXBzCrQqA9S48hcqWDRv3FVFYZKxcq8GV', dpnsDocuments);
};
