const dpnsDocuments = require('dpns-contract/src/schema/dpns-documents');
const Contract = require('../../contract/Contract');

/**
 * @return {Contract}
 */
module.exports = function getContractFixture() {
  return new Contract('dpnsContract', dpnsDocuments);
};
