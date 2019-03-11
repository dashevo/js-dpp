const findDuplicateDPObjectsByIndices = require('../../../../lib/stPacket/validation/findDuplicateDPObjectsByIndices');

const getDPContractFixture = require('../../../../lib/test/fixtures/getDPContractFixture');
const getDPObjectsFixture = require('../../../../lib/test/fixtures/getDPObjectsFixture');

describe('findDuplicateDPObjectsByIndices', () => {
  let rawDPObjects;
  let dpContract;

  beforeEach(() => {
    rawDPObjects = getDPObjectsFixture().map(o => o.toJSON());
    dpContract = getDPContractFixture();
  });

  it('should return duplicate objects if they are present', () => {
    const [, , , william, leon] = rawDPObjects;
    leon.lastName = 'Birkin';
    const duplicates = findDuplicateDPObjectsByIndices(rawDPObjects, dpContract);
    expect(duplicates).to.deep.equal(
      [
        leon,
        william,
      ],
    );
  });

  it('should return an empty array of there are no duplicates', () => {
    const duplicates = findDuplicateDPObjectsByIndices(rawDPObjects, dpContract);
    expect(duplicates.length).to.equal(0);
  });
});
