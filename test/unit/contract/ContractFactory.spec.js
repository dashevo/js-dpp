const rewiremock = require('rewiremock/node');

const getDPContractFixture = require('../../../lib/test/fixtures/getDPContractFixture');

const ValidationResult = require('../../../lib/validation/ValidationResult');

const InvalidContractError = require('../../../lib/contract/errors/InvalidContractError');
const ConsensusError = require('../../../lib/errors/ConsensusError');

describe('ContractFactory', () => {
  let ContractFactory;
  let decodeMock;
  let validateContractMock;
  let createContractMock;
  let factory;
  let dpContract;
  let rawDPContract;

  beforeEach(function beforeEach() {
    dpContract = getDPContractFixture();
    rawDPContract = dpContract.toJSON();

    decodeMock = this.sinonSandbox.stub();
    validateContractMock = this.sinonSandbox.stub();
    createContractMock = this.sinonSandbox.stub().returns(dpContract);

    // Require Factory module for webpack
    // eslint-disable-next-line global-require
    require('../../../lib/contract/ContractFactory');

    ContractFactory = rewiremock.proxy('../../../lib/contract/ContractFactory', {
      '../../../lib/util/serializer': { decode: decodeMock },
    });

    factory = new ContractFactory(
      createContractMock,
      validateContractMock,
    );
  });

  describe('create', () => {
    it('should return new DPContract with specified name and documents definition', () => {
      const result = factory.create(
        rawDPContract.name,
        rawDPContract.documents,
      );

      expect(result).to.equal(dpContract);

      expect(createContractMock).to.have.been.calledOnceWith({
        name: rawDPContract.name,
        documents: rawDPContract.documents,
      });
    });
  });

  describe('createFromObject', () => {
    it('should return new DPContract with data from passed object', () => {
      validateContractMock.returns(new ValidationResult());

      const result = factory.createFromObject(rawDPContract);

      expect(result).to.equal(dpContract);

      expect(validateContractMock).to.have.been.calledOnceWith(rawDPContract);

      expect(createContractMock).to.have.been.calledOnceWith(rawDPContract);
    });

    it('should return new DPContract without validation if "skipValidation" option is passed', () => {
      const result = factory.createFromObject(rawDPContract, { skipValidation: true });

      expect(result).to.equal(dpContract);

      expect(validateContractMock).to.have.not.been.called();

      expect(createContractMock).to.have.been.calledOnceWith(rawDPContract);
    });

    it('should throw an error if passed object is not valid', () => {
      const validationError = new ConsensusError('test');

      validateContractMock.returns(new ValidationResult([validationError]));

      let error;
      try {
        factory.createFromObject(rawDPContract);
      } catch (e) {
        error = e;
      }

      expect(error).to.be.an.instanceOf(InvalidContractError);
      expect(error.getRawDPContract()).to.equal(rawDPContract);

      expect(error.getErrors()).to.have.length(1);

      const [consensusError] = error.getErrors();

      expect(consensusError).to.equal(validationError);

      expect(validateContractMock).to.have.been.calledOnceWith(rawDPContract);

      expect(createContractMock).to.have.not.been.called();
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
