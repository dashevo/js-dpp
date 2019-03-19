const findDuplicateDocuments = require('../../../../lib/stPacket/validation/findDuplicateDocuments');

const getDPObjectsFixture = require('../../../../lib/test/fixtures/getDPObjectsFixture');

describe('findDuplicateDocuments', () => {
  let rawDocuments;

  beforeEach(() => {
    rawDocuments = getDPObjectsFixture().map(o => o.toJSON());
  });

  it('should return empty array if there are no duplicated Documents', () => {
    const result = findDuplicateDocuments(rawDocuments);

    expect(result).to.be.an('array');
    expect(result).to.have.lengthOf(0);
  });

  it('should return duplicated Documents', () => {
    rawDocuments.push(rawDocuments[0]);

    const result = findDuplicateDocuments(rawDocuments);

    expect(result).to.be.an('array');
    expect(result).to.have.lengthOf(2);
    expect(result).to.have.deep.members([
      rawDocuments[0],
      rawDocuments[0],
    ]);
  });
});
