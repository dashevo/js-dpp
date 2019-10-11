const DashPlatformProtocol = require('../../../lib/DashPlatformProtocol');

const DataContract = require('../../../lib/dataContract/DataContract');

const ValidationResult = require('../../../lib/validation/ValidationResult');

const getDataContractFixture = require('../../../lib/test/fixtures/getDataContractFixture');

describe('DataContractFacade', () => {
  let dpp;
  let dataContract;

  beforeEach(() => {
    dpp = new DashPlatformProtocol();

    dataContract = getDataContractFixture();
  });

  describe('create', () => {
    it('should create DataContract', () => {
      const result = dpp.contract.create(
        dataContract.getContractId(),
        dataContract.getDocuments(),
      );

      expect(result).to.be.an.instanceOf(DataContract);

      expect(result.getContractId()).to.equal(dataContract.getContractId());
      expect(result.getDocuments()).to.equal(dataContract.getDocuments());
    });
  });

  describe('createFromObject', () => {
    it('should create DataContract from plain object', () => {
      const result = dpp.contract.createFromObject(dataContract.toJSON());

      expect(result).to.be.an.instanceOf(DataContract);

      expect(result.toJSON()).to.deep.equal(dataContract.toJSON());
    });
  });

  describe('createFromSerialized', () => {
    it('should create DataContract from string', () => {
      const result = dpp.contract.createFromSerialized(dataContract.serialize());

      expect(result).to.be.an.instanceOf(DataContract);

      expect(result.toJSON()).to.deep.equal(dataContract.toJSON());
    });
  });

  describe('validate', () => {
    it('should validate DataContract', () => {
      const result = dpp.contract.validate(dataContract.toJSON());

      expect(result).to.be.an.instanceOf(ValidationResult);
    });
  });
});
