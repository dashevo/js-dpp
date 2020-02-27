const dpnsDocuments = require('@dashevo/dpns-contract/src/schema/dpns-documents');
const DataContractFactory = require('../../dataContract/DataContractFactory');
const createDataContract = require('../../dataContract/createDataContract');

const generateRandomId = require('../utils/generateRandomId');

const ownerId = generateRandomId();

/**
 * @return {DataContract}
 */
module.exports = function getDataContractFixture() {
  const factory = new DataContractFactory(createDataContract, () => {});
  return factory.create(ownerId, dpnsDocuments);
};
