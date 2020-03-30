/**
 * @param sinonSandbox
 * @return {{
 *   fetchDataContract: *,
 *   storeDataContract: *,
 *   fetchDocuments: *,
 *   storeDocuments: *,
 *   removeDocuments: *,
 *   fetchTransaction: *,
 *   fetchIdentity: *,
 *   storeIdentity: *,
 * }}
 */
module.exports = function createStateRepositoryMock(sinonSandbox) {
  return {
    fetchDataContract: sinonSandbox.stub(),
    storeDataContract: sinonSandbox.stub(),
    fetchDocuments: sinonSandbox.stub(),
    storeDocuments: sinonSandbox.stub(),
    removeDocuments: sinonSandbox.stub(),
    fetchTransaction: sinonSandbox.stub(),
    fetchIdentity: sinonSandbox.stub(),
    storeIdentity: sinonSandbox.stub(),
  };
};
