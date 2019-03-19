const DashPlatformProtocol = require('../../../lib/DashPlatformProtocol');

const Document = require('../../../lib/document/Document');

const ValidationResult = require('../../../lib/validation/ValidationResult');

const getDPObjectsFixture = require('../../../lib/test/fixtures/getDPObjectsFixture');
const getDPContractFixture = require('../../../lib/test/fixtures/getDPContractFixture');

const MissingOptionError = require('../../../lib/errors/MissingOptionError');

describe('DPObjectFacade', () => {
  let dpp;
  let document;
  let dpContract;

  beforeEach(() => {
    dpContract = getDPContractFixture();

    dpp = new DashPlatformProtocol({
      userId: '6b74011f5d2ad1a8d45b71b9702f54205ce75253593c3cfbba3fdadeca278288',
      dpContract,
    });

    ([document] = getDPObjectsFixture());
  });

  describe('create', () => {
    it('should create Document', () => {
      const result = dpp.object.create(
        document.getType(),
        document.getData(),
      );

      expect(result).to.be.an.instanceOf(Document);

      expect(result.getType()).to.equal(document.getType());
      expect(result.getData()).to.deep.equal(document.getData());
    });

    it('should throw an error if User ID is not defined', () => {
      dpp = new DashPlatformProtocol({
        dpContract,
      });

      let error;
      try {
        dpp.object.create(
          document.getType(),
          document.getData(),
        );
      } catch (e) {
        error = e;
      }

      expect(error).to.be.an.instanceOf(MissingOptionError);
      expect(error.getOptionName()).to.equal('userId');
    });

    it('should throw an error if DP Contract is not defined', () => {
      dpp = new DashPlatformProtocol({
        userId: '6b74011f5d2ad1a8d45b71b9702f54205ce75253593c3cfbba3fdadeca278288',
      });

      let error;
      try {
        dpp.object.create(
          document.getType(),
          document.getData(),
        );
      } catch (e) {
        error = e;
      }

      expect(error).to.be.an.instanceOf(MissingOptionError);
      expect(error.getOptionName()).to.equal('dpContract');
    });
  });

  describe('createFromObject', () => {
    it('should create Document from plain object', () => {
      const result = dpp.object.createFromObject(document.toJSON());

      expect(result).to.be.an.instanceOf(Document);

      expect(result.toJSON()).to.deep.equal(document.toJSON());
    });

    it('should throw an error if User ID is not defined', () => {
      dpp = new DashPlatformProtocol({
        dpContract,
      });

      let error;
      try {
        dpp.object.createFromObject(document.toJSON());
      } catch (e) {
        error = e;
      }

      expect(error).to.be.an.instanceOf(MissingOptionError);
      expect(error.getOptionName()).to.equal('userId');
    });

    it('should throw an error if DP Contract is not defined', () => {
      dpp = new DashPlatformProtocol({
        userId: '6b74011f5d2ad1a8d45b71b9702f54205ce75253593c3cfbba3fdadeca278288',
      });

      let error;
      try {
        dpp.object.createFromObject(document.toJSON());
      } catch (e) {
        error = e;
      }

      expect(error).to.be.an.instanceOf(MissingOptionError);
      expect(error.getOptionName()).to.equal('dpContract');
    });
  });

  describe('createFromSerialized', () => {
    it('should create Document from string', () => {
      const result = dpp.object.createFromSerialized(document.serialize());

      expect(result).to.be.an.instanceOf(Document);

      expect(result.toJSON()).to.deep.equal(document.toJSON());
    });

    it('should throw an error if User ID is not defined', () => {
      dpp = new DashPlatformProtocol({
        dpContract,
      });

      let error;
      try {
        dpp.object.createFromSerialized(document.serialize());
      } catch (e) {
        error = e;
      }

      expect(error).to.be.an.instanceOf(MissingOptionError);
      expect(error.getOptionName()).to.equal('userId');
    });

    it('should throw an error if DP Contract is not defined', () => {
      dpp = new DashPlatformProtocol({
        userId: '6b74011f5d2ad1a8d45b71b9702f54205ce75253593c3cfbba3fdadeca278288',
      });

      let error;
      try {
        dpp.object.createFromSerialized(document.serialize());
      } catch (e) {
        error = e;
      }

      expect(error).to.be.an.instanceOf(MissingOptionError);
      expect(error.getOptionName()).to.equal('dpContract');
    });
  });

  describe('validate', () => {
    it('should validate Document', () => {
      const result = dpp.object.validate(document.toJSON());

      expect(result).to.be.an.instanceOf(ValidationResult);
    });
  });
});
