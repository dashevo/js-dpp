const getDPObjectsFixture = require('../../../../lib/test/fixtures/getDPObjectsFixture');
const getDPContractFixture = require('../../../../lib/test/fixtures/getDPContractFixture');

const fetchDPObjectsByObjectsFactory = require('../../../../lib/stPacket/verification/fetchDPObjectsByObjectsFactory');

const createDataProviderMock = require('../../../../lib/test/mocks/createDataProviderMock');

describe('fetchDPObjectsByObjects', () => {
  let fetchDPObjectsByObjects;
  let dataProviderMock;
  let dpObjects;
  let dpContract;

  beforeEach(function beforeEach() {
    dataProviderMock = createDataProviderMock(this.sinonSandbox);

    fetchDPObjectsByObjects = fetchDPObjectsByObjectsFactory(dataProviderMock);

    dpObjects = getDPObjectsFixture();
    dpContract = getDPContractFixture();
  });

  it('should fetch specified DP Objects using DataProvider', async () => {
    dataProviderMock.fetchDPObjects.withArgs(
      dpContract.getId(),
      dpObjects[0].getType(),
    ).resolves([dpObjects[0]]);

    dataProviderMock.fetchDPObjects.withArgs(
      dpContract.getId(),
      dpObjects[1].getType(),
    ).resolves([dpObjects[1], dpObjects[2]]);

    const fetchedDPObjects = await fetchDPObjectsByObjects(dpContract.getId(), dpObjects);

    expect(dataProviderMock.fetchDPObjects).to.have.been.calledTwice();

    let where = { id: { $in: [dpObjects[0].getId()] } };

    expect(dataProviderMock.fetchDPObjects).to.have.been.calledWith(
      dpContract.getId(),
      dpObjects[0].getType(),
      { where },
    );

    where = { id: { $in: [dpObjects[1].getId(), dpObjects[2].getId()] } };

    expect(dataProviderMock.fetchDPObjects).to.have.been.calledWith(
      dpContract.getId(),
      dpObjects[1].getType(),
      { where },
    );

    expect(fetchedDPObjects).to.deep.equal(dpObjects);
  });
});
