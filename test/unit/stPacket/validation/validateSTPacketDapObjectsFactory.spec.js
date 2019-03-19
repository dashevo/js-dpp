const getDPContractFixture = require('../../../../lib/test/fixtures/getDPContractFixture');
const getDPObjectsFixture = require('../../../../lib/test/fixtures/getDPObjectsFixture');

const ValidationResult = require('../../../../lib/validation/ValidationResult');

const validateSTPacketDPObjectsFactory = require('../../../../lib/stPacket/validation/validateSTPacketDPObjectsFactory');

const { expectValidationError } = require('../../../../lib/test/expect/expectError');

const DuplicateDocumentsError = require('../../../../lib/errors/DuplicateDocumentsError');
const InvalidDPContractError = require('../../../../lib/errors/InvalidDPContractError');
const ConsensusError = require('../../../../lib/errors/ConsensusError');

describe('validateSTPacketDPObjectsFactory', () => {
  let rawSTPacket;
  let dpContract;
  let rawDocuments;
  let findDuplicatedDPObjectsMock;
  let findDuplicateDPObjectsByIndicesMock;
  let validateDocumentMock;
  let validateSTPacketDPObjects;

  beforeEach(function beforeEach() {
    dpContract = getDPContractFixture();
    rawDocuments = getDPObjectsFixture().map(o => o.toJSON());
    rawSTPacket = {
      contractId: dpContract.getId(),
      itemsMerkleRoot: '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
      itemsHash: '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
      contracts: [],
      documents: rawDocuments,
    };

    findDuplicatedDPObjectsMock = this.sinonSandbox.stub().returns([]);
    findDuplicateDPObjectsByIndicesMock = this.sinonSandbox.stub().returns([]);
    validateDocumentMock = this.sinonSandbox.stub().returns(new ValidationResult());

    validateSTPacketDPObjects = validateSTPacketDPObjectsFactory(
      validateDocumentMock,
      findDuplicatedDPObjectsMock,
      findDuplicateDPObjectsByIndicesMock,
    );
  });

  it('should return invalid result if ST Packet has different ID than DPContract', () => {
    rawSTPacket.contractId = '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b';

    const result = validateSTPacketDPObjects(rawSTPacket, dpContract);

    expectValidationError(result, InvalidDPContractError);

    const [error] = result.getErrors();

    expect(error.getDPContract()).to.equal(dpContract);
    expect(error.getRawSTPacket()).to.equal(rawSTPacket);

    expect(validateDocumentMock.callCount).to.equal(5);

    rawSTPacket.documents.forEach((rawDocument) => {
      expect(validateDocumentMock).to.have.been.calledWith(rawDocument, dpContract);
    });
  });

  it('should return invalid result if there are duplicates Documents', () => {
    findDuplicatedDPObjectsMock.returns([rawDocuments[0]]);

    const result = validateSTPacketDPObjects(rawSTPacket, dpContract);

    expectValidationError(result, DuplicateDocumentsError);

    expect(findDuplicatedDPObjectsMock).to.have.been.calledOnceWith(rawDocuments);

    const [error] = result.getErrors();

    expect(error.getDuplicatedDocuments()).to.deep.equal([rawDocuments[0]]);

    expect(validateDocumentMock.callCount).to.equal(5);

    rawSTPacket.documents.forEach((rawDocument) => {
      expect(validateDocumentMock).to.have.been.calledWith(rawDocument, dpContract);
    });
  });

  it('should return invalid result if Documents are invalid', () => {
    const dpObjectError = new ConsensusError('test');

    validateDocumentMock.onCall(0).returns(
      new ValidationResult([dpObjectError]),
    );

    const result = validateSTPacketDPObjects(rawSTPacket, dpContract);

    expectValidationError(result, ConsensusError, 1);

    expect(findDuplicatedDPObjectsMock).to.have.been.calledOnceWith(rawDocuments);

    expect(validateDocumentMock.callCount).to.equal(5);

    const [error] = result.getErrors();

    expect(error).to.equal(dpObjectError);
  });

  it('should return valid result if there are no duplicate Documents and they are valid', () => {
    const result = validateSTPacketDPObjects(rawSTPacket, dpContract);

    expect(result).to.be.an.instanceOf(ValidationResult);
    expect(result.isValid()).to.be.true();

    expect(findDuplicatedDPObjectsMock).to.have.been.calledOnceWith(rawDocuments);

    expect(validateDocumentMock.callCount).to.equal(5);
  });
});
