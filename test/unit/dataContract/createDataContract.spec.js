const createDataContract = require('../../../lib/dataContract/createDataContract');
const DataContract = require('../../../lib/dataContract/DataContract');

describe('createDataContract', () => {
  let rawDataContract;

  beforeEach(() => {
    rawDataContract = {
      contractId: '6b74011f5d2ad1a8d45b71b9702f54205ce75253593c3cfbba3fdadeca278288',
      documents: {
        niceDocument: {
          name: { type: 'string' },
        },
      },
    };
  });

  it('should return new DataContract with "contractId" and documents', () => {
    const contract = createDataContract(rawDataContract);

    expect(contract).to.be.an.instanceOf(DataContract);

    expect(contract.getContractId()).to.equal(rawDataContract.contractId);
    expect(contract.getDocuments()).to.equal(rawDataContract.documents);
  });

  it('should return new DataContract with "$schema" if present', () => {
    rawDataContract.$schema = 'http://test.com/schema';

    const contract = createDataContract(rawDataContract);

    expect(contract).to.be.an.instanceOf(DataContract);

    expect(contract.getJsonMetaSchema()).to.equal(rawDataContract.$schema);

    expect(contract.getContractId()).to.equal(rawDataContract.contractId);
    expect(contract.getDocuments()).to.equal(rawDataContract.documents);
  });

  it('should return new DataContract with "version" if present', () => {
    rawDataContract.version = 1;

    const contract = createDataContract(rawDataContract);

    expect(contract).to.be.an.instanceOf(DataContract);

    expect(contract.getVersion()).to.equal(rawDataContract.version);

    expect(contract.getContractId()).to.equal(rawDataContract.contractId);
    expect(contract.getDocuments()).to.equal(rawDataContract.documents);
  });

  it('should return new DataContract with "definitions" if present', () => {
    rawDataContract.definitions = {
      subSchema: { type: 'object' },
    };

    const contract = createDataContract(rawDataContract);

    expect(contract).to.be.an.instanceOf(DataContract);

    expect(contract.getDefinitions()).to.equal(rawDataContract.definitions);

    expect(contract.getContractId()).to.equal(rawDataContract.contractId);
    expect(contract.getDocuments()).to.equal(rawDataContract.documents);
  });
});
