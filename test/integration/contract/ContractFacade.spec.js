const DashPlatformProtocol = require('../../../lib/DashPlatformProtocol');

const Contract = require('../../../lib/contract/Contract');

const ValidationResult = require('../../../lib/validation/ValidationResult');

const getDPContractFixture = require('../../../lib/test/fixtures/getDPContractFixture');

describe('ContractFacade', () => {
  let dpp;
  let dpContract;

  beforeEach(() => {
    dpp = new DashPlatformProtocol();

    dpContract = getDPContractFixture();
  });

  describe('create', () => {
    it('should create Contract', () => {
      const result = dpp.contract.create(
        dpContract.getName(),
        dpContract.getDocuments(),
      );

      expect(result).to.be.an.instanceOf(Contract);

      expect(result.getName()).to.equal(dpContract.getName());
      expect(result.getDocuments()).to.equal(dpContract.getDocuments());
    });
  });

  describe('createFromObject', () => {
    it('should create Contract from plain object', () => {
      const result = dpp.contract.createFromObject(dpContract.toJSON());

      expect(result).to.be.an.instanceOf(Contract);

      expect(result.toJSON()).to.deep.equal(dpContract.toJSON());
    });
  });

  describe('createFromSerialized', () => {
    it('should create Contract from string', () => {
      const result = dpp.contract.createFromSerialized(dpContract.serialize());

      expect(result).to.be.an.instanceOf(Contract);

      expect(result.toJSON()).to.deep.equal(dpContract.toJSON());
    });
  });

  describe('validate', () => {
    it('should validate Contract', () => {
      const result = dpp.contract.validate(dpContract.toJSON());

      expect(result).to.be.an.instanceOf(ValidationResult);
    });
  });
});
