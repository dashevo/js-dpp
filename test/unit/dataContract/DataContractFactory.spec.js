const rewiremock = require('rewiremock/node');

const getDataContractFixture = require('../../../lib/test/fixtures/getDataContractFixture');

const ValidationResult = require('../../../lib/validation/ValidationResult');

const InvalidContractError = require('../../../lib/dataContract/errors/InvalidDataContractError');
const ConsensusError = require('../../../lib/errors/ConsensusError');

describe('DataContractFactory', () => {
  let ContractFactory;
  let decodeMock;
  let validateContractMock;
  let createContractMock;
  let factory;
  let dataContract;
  let rawDataContract;

  beforeEach(function beforeEach() {
    dataContract = getDataContractFixture();
    rawDataContract = dataContract.toJSON();

    decodeMock = this.sinonSandbox.stub();
    validateContractMock = this.sinonSandbox.stub();
    createContractMock = this.sinonSandbox.stub().returns(dataContract);

    // Require Factory module for webpack
    // eslint-disable-next-line global-require
    require('../../../lib/dataContract/DataContractFactory');

    ContractFactory = rewiremock.proxy('../../../lib/contract/ContractFactory', {
      '../../../lib/util/serializer': { decode: decodeMock },
    });

    factory = new ContractFactory(
      createContractMock,
      validateContractMock,
    );
  });

  describe('create', () => {
    it('should return new Contract with specified name and documents definition', () => {
      const result = factory.create(
        rawDataContract.contractId,
        rawDataContract.documents,
      );

      expect(result).to.equal(dataContract);

      expect(createContractMock).to.have.been.calledOnceWith({
        contractId: rawDataContract.contractId,
        documents: rawDataContract.documents,
      });
    });
  });

  describe('createFromObject', () => {
    it('should return new Contract with data from passed object', () => {
      validateContractMock.returns(new ValidationResult());

      const result = factory.createFromObject(rawDataContract);

      expect(result).to.equal(dataContract);

      expect(validateContractMock).to.have.been.calledOnceWith(rawDataContract);

      expect(createContractMock).to.have.been.calledOnceWith(rawDataContract);
    });

    it('should return new Contract without validation if "skipValidation" option is passed', () => {
      const result = factory.createFromObject(rawDataContract, { skipValidation: true });

      expect(result).to.equal(dataContract);

      expect(validateContractMock).to.have.not.been.called();

      expect(createContractMock).to.have.been.calledOnceWith(rawDataContract);
    });

    it('should throw an error if passed object is not valid', () => {
      const validationError = new ConsensusError('test');

      validateContractMock.returns(new ValidationResult([validationError]));

      let error;
      try {
        factory.createFromObject(rawDataContract);
      } catch (e) {
        error = e;
      }

      expect(error).to.be.an.instanceOf(InvalidContractError);
      expect(error.getRawDataContract()).to.equal(rawDataContract);

      expect(error.getErrors()).to.have.length(1);

      const [consensusError] = error.getErrors();

      expect(consensusError).to.equal(validationError);

      expect(validateContractMock).to.have.been.calledOnceWith(rawDataContract);

      expect(createContractMock).to.have.not.been.called();
    });
  });

  describe('createFromSerialized', () => {
    beforeEach(function beforeEach() {
      this.sinonSandbox.stub(factory, 'createFromObject');
    });

    it('should return new Contract from serialized Contract', () => {
      const serializedContract = dataContract.serialize();

      decodeMock.returns(rawDataContract);

      factory.createFromObject.returns(dataContract);

      const result = factory.createFromSerialized(serializedContract);

      expect(result).to.equal(dataContract);

      expect(factory.createFromObject).to.have.been.calledOnceWith(rawDataContract);

      expect(decodeMock).to.have.been.calledOnceWith(serializedContract);
    });
  });
});
