const createDPContract = require('../../../lib/contract/createDPContract');
const Contract = require('../../../lib/contract/Contract');

describe('createDPContract', () => {
  let rawDPContract;
  beforeEach(() => {
    rawDPContract = {
      name: 'LovelyContract',
      documents: {
        niceDocument: {
          name: { type: 'string' },
        },
      },
    };
  });

  it('should return new Contract with "name" and documents', () => {
    const dpContract = createDPContract(rawDPContract);

    expect(dpContract).to.be.an.instanceOf(Contract);

    expect(dpContract.getName()).to.equal(rawDPContract.name);
    expect(dpContract.getDocuments()).to.equal(rawDPContract.documents);
  });

  it('should return new Contract with "$schema" if present', () => {
    rawDPContract.$schema = 'http://test.com/schema';

    const dpContract = createDPContract(rawDPContract);

    expect(dpContract).to.be.an.instanceOf(Contract);

    expect(dpContract.getJsonMetaSchema()).to.equal(rawDPContract.$schema);

    expect(dpContract.getName()).to.equal(rawDPContract.name);
    expect(dpContract.getDocuments()).to.equal(rawDPContract.documents);
  });

  it('should return new Contract with "version" if present', () => {
    rawDPContract.version = 1;

    const dpContract = createDPContract(rawDPContract);

    expect(dpContract).to.be.an.instanceOf(Contract);

    expect(dpContract.getVersion()).to.equal(rawDPContract.version);

    expect(dpContract.getName()).to.equal(rawDPContract.name);
    expect(dpContract.getDocuments()).to.equal(rawDPContract.documents);
  });

  it('should return new Contract with "definitions" if present', () => {
    rawDPContract.definitions = {
      subSchema: { type: 'object' },
    };

    const dpContract = createDPContract(rawDPContract);

    expect(dpContract).to.be.an.instanceOf(Contract);

    expect(dpContract.getDefinitions()).to.equal(rawDPContract.definitions);

    expect(dpContract.getName()).to.equal(rawDPContract.name);
    expect(dpContract.getDocuments()).to.equal(rawDPContract.documents);
  });
});
