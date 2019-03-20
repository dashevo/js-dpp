const createContract = require('../../../lib/contract/createContract');
const Contract = require('../../../lib/contract/Contract');

describe('createContract', () => {
  let rawContract;
  beforeEach(() => {
    rawContract = {
      name: 'LovelyContract',
      documents: {
        niceDocument: {
          name: { type: 'string' },
        },
      },
    };
  });

  it('should return new Contract with "name" and documents', () => {
    const dpContract = createContract(rawContract);

    expect(dpContract).to.be.an.instanceOf(Contract);

    expect(dpContract.getName()).to.equal(rawContract.name);
    expect(dpContract.getDocuments()).to.equal(rawContract.documents);
  });

  it('should return new Contract with "$schema" if present', () => {
    rawContract.$schema = 'http://test.com/schema';

    const dpContract = createContract(rawContract);

    expect(dpContract).to.be.an.instanceOf(Contract);

    expect(dpContract.getJsonMetaSchema()).to.equal(rawContract.$schema);

    expect(dpContract.getName()).to.equal(rawContract.name);
    expect(dpContract.getDocuments()).to.equal(rawContract.documents);
  });

  it('should return new Contract with "version" if present', () => {
    rawContract.version = 1;

    const dpContract = createContract(rawContract);

    expect(dpContract).to.be.an.instanceOf(Contract);

    expect(dpContract.getVersion()).to.equal(rawContract.version);

    expect(dpContract.getName()).to.equal(rawContract.name);
    expect(dpContract.getDocuments()).to.equal(rawContract.documents);
  });

  it('should return new Contract with "definitions" if present', () => {
    rawContract.definitions = {
      subSchema: { type: 'object' },
    };

    const dpContract = createContract(rawContract);

    expect(dpContract).to.be.an.instanceOf(Contract);

    expect(dpContract.getDefinitions()).to.equal(rawContract.definitions);

    expect(dpContract.getName()).to.equal(rawContract.name);
    expect(dpContract.getDocuments()).to.equal(rawContract.documents);
  });
});
