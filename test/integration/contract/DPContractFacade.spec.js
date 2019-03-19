const DashPlatformProtocol = require('../../../lib/DashPlatformProtocol');

const DPContract = require('../../../lib/contract/DPContract');

const ValidationResult = require('../../../lib/validation/ValidationResult');

const getDPContractFixture = require('../../../lib/test/fixtures/getDPContractFixture');

describe('DPContractFacade', () => {
  let dpp;
  let dpContract;

  beforeEach(() => {
    dpp = new DashPlatformProtocol();

    dpContract = getDPContractFixture();
  });

  describe('create', () => {
    it('should create DP Contract', () => {
      const result = dpp.contract.create(
        dpContract.getName(),
        dpContract.getDocuments(),
      );

      expect(result).to.be.an.instanceOf(DPContract);

      expect(result.getName()).to.equal(dpContract.getName());
      expect(result.getDocuments()).to.equal(dpContract.getDocuments());
    });
  });

  describe('createFromObject', () => {
    it('should create DP Contract from plain object', () => {
      const result = dpp.contract.createFromObject(dpContract.toJSON());

      expect(result).to.be.an.instanceOf(DPContract);

      expect(result.toJSON()).to.deep.equal(dpContract.toJSON());
    });
  });

  describe('createFromSerialized', () => {
    it('should create DP Contract from string', () => {
      const result = dpp.contract.createFromSerialized(dpContract.serialize());

      expect(result).to.be.an.instanceOf(DPContract);

      expect(result.toJSON()).to.deep.equal(dpContract.toJSON());
    });
  });

  describe('validate', () => {
    it('should validate DP Contract', () => {
      const result = dpp.contract.validate(dpContract.toJSON());

      expect(result).to.be.an.instanceOf(ValidationResult);
    });
  });
});
