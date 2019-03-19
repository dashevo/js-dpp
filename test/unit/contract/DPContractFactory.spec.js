const rewiremock = require('rewiremock/node');

const getDPContractFixture = require('../../../lib/test/fixtures/getDPContractFixture');

const ValidationResult = require('../../../lib/validation/ValidationResult');

const InvalidDPContractError = require('../../../lib/contract/errors/InvalidDPContractError');
const ConsensusError = require('../../../lib/errors/ConsensusError');

describe('DPContractFactory', () => {
  let DPContractFactory;
  let decodeMock;
  let validateDPContractMock;
  let createDPContractMock;
  let factory;
  let dpContract;
  let rawDPContract;

  beforeEach(function beforeEach() {
    dpContract = getDPContractFixture();
    rawDPContract = dpContract.toJSON();

    decodeMock = this.sinonSandbox.stub();
    validateDPContractMock = this.sinonSandbox.stub();
    createDPContractMock = this.sinonSandbox.stub().returns(dpContract);

    // Require Factory module for webpack
    // eslint-disable-next-line global-require
    require('../../../lib/contract/DPContractFactory');

    DPContractFactory = rewiremock.proxy('../../../lib/contract/DPContractFactory', {
      '../../../lib/util/serializer': { decode: decodeMock },
    });

    factory = new DPContractFactory(
      createDPContractMock,
      validateDPContractMock,
    );
  });

  describe('create', () => {
    it('should return new DPContract with specified name and documents definition', () => {
      const result = factory.create(
        rawDPContract.name,
        rawDPContract.documents,
      );

      expect(result).to.equal(dpContract);

      expect(createDPContractMock).to.have.been.calledOnceWith({
        name: rawDPContract.name,
        documents: rawDPContract.documents,
      });
    });
  });

  describe('createFromObject', () => {
    it('should return new DPContract with data from passed object', () => {
      validateDPContractMock.returns(new ValidationResult());

      const result = factory.createFromObject(rawDPContract);

      expect(result).to.equal(dpContract);

      expect(validateDPContractMock).to.have.been.calledOnceWith(rawDPContract);

      expect(createDPContractMock).to.have.been.calledOnceWith(rawDPContract);
    });

    it('should return new DPContract without validation if "skipValidation" option is passed', () => {
      const result = factory.createFromObject(rawDPContract, { skipValidation: true });

      expect(result).to.equal(dpContract);

      expect(validateDPContractMock).to.have.not.been.called();

      expect(createDPContractMock).to.have.been.calledOnceWith(rawDPContract);
    });

    it('should throw an error if passed object is not valid', () => {
      const validationError = new ConsensusError('test');

      validateDPContractMock.returns(new ValidationResult([validationError]));

      let error;
      try {
        factory.createFromObject(rawDPContract);
      } catch (e) {
        error = e;
      }

      expect(error).to.be.an.instanceOf(InvalidDPContractError);
      expect(error.getRawDPContract()).to.equal(rawDPContract);

      expect(error.getErrors()).to.have.length(1);

      const [consensusError] = error.getErrors();

      expect(consensusError).to.equal(validationError);

      expect(validateDPContractMock).to.have.been.calledOnceWith(rawDPContract);

      expect(createDPContractMock).to.have.not.been.called();
    });
  });

  describe('createFromSerialized', () => {
    beforeEach(function beforeEach() {
      this.sinonSandbox.stub(factory, 'createFromObject');
    });

    it('should return new DPContract from serialized DPContract', () => {
      const serializedDPContract = dpContract.serialize();

      decodeMock.returns(rawDPContract);

      factory.createFromObject.returns(dpContract);

      const result = factory.createFromSerialized(serializedDPContract);

      expect(result).to.equal(dpContract);

      expect(factory.createFromObject).to.have.been.calledOnceWith(rawDPContract);

      expect(decodeMock).to.have.been.calledOnceWith(serializedDPContract);
    });
  });
});
