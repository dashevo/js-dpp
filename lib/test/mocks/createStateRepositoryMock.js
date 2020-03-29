/**
 * @param sinonSandbox
 * @return {{fetchDataContract: *, fetchDocuments: *, fetchTransaction: *, fetchIdentity: *}}
 */
module.exports = function createStateRepositoryMock(sinonSandbox) {
  return {
    fetchDataContract: sinonSandbox.stub(),
    fetchDocuments: sinonSandbox.stub(),
    fetchTransaction: sinonSandbox.stub(),
    fetchIdentity: sinonSandbox.stub(),
  };
};
