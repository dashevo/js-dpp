const DashPlatformProtocol = require('../../lib/DashPlatformProtocol');

const getContractFixture = require('../../lib/test/fixtures/getContractFixture');

const createDataProviderMock = require('../../lib/test/mocks/createDataProviderMock');

describe('DashPlatformProtocol', () => {
  let dpp;
  let userId;
  let dpContract;
  let dataProvider;

  beforeEach(function beforeEach() {
    userId = '6b74011f5d2ad1a8d45b71b9702f54205ce75253593c3cfbba3fdadeca278288';
    dpContract = getContractFixture();
    dataProvider = createDataProviderMock(this.sinonSandbox);

    dpp = new DashPlatformProtocol();
  });

  describe('setUserId', () => {
    it('should set User ID', () => {
      const result = dpp.setUserId(userId);

      expect(result).to.be.an.instanceOf(DashPlatformProtocol);

      expect(dpp.userId).to.equal(userId);
    });
  });

  describe('getUserId', () => {
    it('should return User ID', () => {
      dpp.userId = userId;

      const result = dpp.getUserId();

      expect(result).to.equal(userId);
    });
  });

  describe('setContract', () => {
    it('should set User ID', () => {
      const result = dpp.setContract(dpContract);

      expect(result).to.be.an.instanceOf(DashPlatformProtocol);

      expect(dpp.dpContract).to.equal(dpContract);
    });
  });

  describe('getContract', () => {
    it('should return Contract', () => {
      dpp.dpContract = dpContract;

      const result = dpp.getContract();

      expect(result).to.equal(dpContract);
    });
  });

  describe('setDataProvider', () => {
    it('should set Data Provider', () => {
      const result = dpp.setDataProvider(dataProvider);

      expect(result).to.be.an.instanceOf(DashPlatformProtocol);

      expect(dpp.dataProvider).to.equal(dataProvider);
    });
  });

  describe('getDataProvider', () => {
    it('should return Data Provider', () => {
      dpp.dataProvider = dataProvider;

      const result = dpp.getDataProvider();

      expect(result).to.equal(dataProvider);
    });
  });
});
