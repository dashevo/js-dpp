/**
 * @param sinonSandbox
 * @return {{fetchDataContract: function(dataContractId:string) : Promise<DataContract|null>,
 *       fetchTransaction: function(dataContractId:string) : Promise<{confirmations: number}>,
 *       fetchDocuments: function(dataContractId:string, type:string, where: Object) :
 *       Promise<Document[]>}}
 */
module.exports = function createDataProviderMock(sinonSandbox) {
  return {
    fetchDataContract: sinonSandbox.stub(),
    fetchDocuments: sinonSandbox.stub(),
    fetchTransaction: sinonSandbox.stub(),
  };
};
