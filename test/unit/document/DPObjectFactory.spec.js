const rewiremock = require('rewiremock/node');

const Document = require('../../../lib/document/Document');

const getDPObjectsFixture = require('../../../lib/test/fixtures/getDPObjectsFixture');
const getDPContractFixture = require('../../../lib/test/fixtures/getDPContractFixture');

const ValidationResult = require('../../../lib/validation/ValidationResult');

const InvalidDocumentTypeError = require('../../../lib/errors/InvalidDocumentTypeError');
const InvalidDocumentError = require('../../../lib/document/errors/InvalidDocumentError');
const ConsensusError = require('../../../lib/errors/ConsensusError');

describe('DPObjectFactory', () => {
  let hashMock;
  let decodeMock;
  let generateMock;
  let validateDPObjectMock;
  let DPObjectFactory;
  let userId;
  let dpContract;
  let document;
  let rawDocument;
  let factory;

  beforeEach(function beforeEach() {
    hashMock = this.sinonSandbox.stub();
    decodeMock = this.sinonSandbox.stub();
    generateMock = this.sinonSandbox.stub();
    validateDPObjectMock = this.sinonSandbox.stub();

    DPObjectFactory = rewiremock.proxy('../../../lib/document/DPObjectFactory', {
      '../../../lib/util/hash': hashMock,
      '../../../lib/util/serializer': { decode: decodeMock },
      '../../../lib/util/entropy': { generate: generateMock },
      '../../../lib/document/Document': Document,
    });

    ({ userId } = getDPObjectsFixture);
    dpContract = getDPContractFixture();

    [document] = getDPObjectsFixture();
    rawDocument = document.toJSON();

    factory = new DPObjectFactory(
      userId,
      dpContract,
      validateDPObjectMock,
    );
  });

  describe('create', () => {
    it('should return new Document with specified type and data', () => {
      const scope = '123';
      const scopeId = '456';
      const name = 'Cutie';

      hashMock.returns(scope);
      generateMock.returns(scopeId);

      const newDPObject = factory.create(
        rawDocument.$type,
        { name },
      );

      expect(newDPObject).to.be.an.instanceOf(Document);

      expect(newDPObject.getType()).to.equal(rawDocument.$type);

      expect(newDPObject.get('name')).to.equal(name);

      expect(hashMock).to.have.been.calledOnceWith(dpContract.getId() + userId);
      expect(newDPObject.scope).to.equal(scope);

      expect(generateMock).to.have.been.calledOnce();
      expect(newDPObject.scopeId).to.equal(scopeId);

      expect(newDPObject.getAction()).to.equal(Document.DEFAULTS.ACTION);

      expect(newDPObject.getRevision()).to.equal(Document.DEFAULTS.REVISION);
    });

    it('should throw an error if type is not defined', () => {
      const type = 'wrong';

      let error;
      try {
        factory.create(type);
      } catch (e) {
        error = e;
      }

      expect(error).to.be.an.instanceOf(InvalidDocumentTypeError);
      expect(error.getType()).to.equal(type);
      expect(error.getDPContract()).to.equal(dpContract);

      expect(hashMock).to.have.not.been.called();
    });
  });

  describe('createFromObject', () => {
    it('should return new DPContract with data from passed object', () => {
      validateDPObjectMock.returns(new ValidationResult());

      const result = factory.createFromObject(rawDocument);

      expect(result).to.be.an.instanceOf(Document);
      expect(result.toJSON()).to.deep.equal(rawDocument);

      expect(validateDPObjectMock).to.have.been.calledOnceWith(rawDocument, dpContract);
    });

    it('should return new Document without validation if "skipValidation" option is passed', () => {
      const result = factory.createFromObject(rawDocument, { skipValidation: true });

      expect(result).to.be.an.instanceOf(Document);
      expect(result.toJSON()).to.deep.equal(rawDocument);

      expect(validateDPObjectMock).to.have.not.been.called();
    });

    it('should throw an error if passed object is not valid', () => {
      const validationError = new ConsensusError('test');

      validateDPObjectMock.returns(new ValidationResult([validationError]));

      let error;
      try {
        factory.createFromObject(rawDocument);
      } catch (e) {
        error = e;
      }

      expect(error).to.be.an.instanceOf(InvalidDocumentError);

      expect(error.getErrors()).to.have.length(1);
      expect(error.getRawDocument()).to.equal(rawDocument);

      const [consensusError] = error.getErrors();
      expect(consensusError).to.equal(validationError);

      expect(validateDPObjectMock).to.have.been.calledOnceWith(rawDocument, dpContract);
    });
  });

  describe('createFromSerialized', () => {
    beforeEach(function beforeEach() {
      this.sinonSandbox.stub(factory, 'createFromObject');
    });

    it('should return new DPContract from serialized DPContract', () => {
      const serializedDPObject = document.serialize();

      decodeMock.returns(rawDocument);

      factory.createFromObject.returns(document);

      const result = factory.createFromSerialized(serializedDPObject);

      expect(result).to.equal(document);

      expect(factory.createFromObject).to.have.been.calledOnceWith(rawDocument);

      expect(decodeMock).to.have.been.calledOnceWith(serializedDPObject);
    });
  });

  describe('setUserId', () => {
    it('should set User ID', () => {
      userId = '123';

      const result = factory.setUserId(userId);

      expect(result).to.equal(factory);
      expect(factory.userId).to.equal(userId);
    });
  });

  describe('getUserId', () => {
    it('should return User ID', () => {
      const result = factory.getUserId();

      expect(result).to.equal(userId);
    });
  });

  describe('setDPContract', () => {
    it('should set DP Contract', () => {
      factory.dpContract = null;

      const result = factory.setDPContract(dpContract);

      expect(result).to.equal(factory);
      expect(factory.dpContract).to.equal(dpContract);
    });
  });

  describe('getDPContract', () => {
    it('should return DP Contract', () => {
      const result = factory.getDPContract();

      expect(result).to.equal(dpContract);
    });
  });
});
