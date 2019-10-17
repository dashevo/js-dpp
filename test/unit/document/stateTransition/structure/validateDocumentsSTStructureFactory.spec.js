const DocumentsStateTransition = require('../../../../../lib/document/stateTransition/DocumentsStateTransition');

const getContractFixture = require('../../../../../lib/test/fixtures/getDataContractFixture');
const getDocumentsFixture = require('../../../../../lib/test/fixtures/getDocumentsFixture');

const ValidationResult = require('../../../../../lib/validation/ValidationResult');

const validateDocumentsSTStructureFactory = require('../../../../../lib/document/stateTransition/validation/structure/validateDocumentsSTStructureFactory');

const { expectValidationError } = require('../../../../../lib/test/expect/expectError');

const DuplicateDocumentsError = require('../../../../../lib/errors/STDuplicateDocumentsError');
const MismatchSTDocumentsAndActionsError = require('../../../../../lib/errors/MismatchSTDocumentsAndActionsError');
const STContainsDocumentsFromDifferentUsersError = require('../../../../../lib/errors/STContainsDocumentsFromDifferentUsersError');
const ConsensusError = require('../../../../../lib/errors/ConsensusError');

describe('validateDocumentsSTStructureFactory', () => {
  let dataContract;
  let documents;
  let rawStateTransition;
  let findDuplicateDocumentsByIdMock;
  let findDuplicateDocumentsByIndicesMock;
  let validateDocumentMock;
  let validateSTPacketDocuments;

  beforeEach(function beforeEach() {
    dataContract = getContractFixture();
    documents = getDocumentsFixture();
    const stateTransition = new DocumentsStateTransition(documents);
    rawStateTransition = stateTransition.toJSON();

    findDuplicateDocumentsByIdMock = this.sinonSandbox.stub().returns([]);
    findDuplicateDocumentsByIndicesMock = this.sinonSandbox.stub().returns([]);
    validateDocumentMock = this.sinonSandbox.stub().returns(new ValidationResult());

    validateSTPacketDocuments = validateDocumentsSTStructureFactory(
      validateDocumentMock,
      findDuplicateDocumentsByIdMock,
      findDuplicateDocumentsByIndicesMock,
    );
  });

  it('should return invalid result if actions and documents count are not equal', () => {
    rawStateTransition.actions.push(3);

    const result = validateSTPacketDocuments(rawStateTransition, dataContract);

    expectValidationError(result, MismatchSTDocumentsAndActionsError);

    const [error] = result.getErrors();

    expect(error.getRawStateTransition()).to.equal(rawStateTransition);

    expect(validateDocumentMock).to.not.be.called();
    expect(findDuplicateDocumentsByIdMock).to.not.be.called();
    expect(findDuplicateDocumentsByIndicesMock).to.not.be.called();
  });

  it('should return invalid result if Documents are invalid', () => {
    const documentError = new ConsensusError('test');

    validateDocumentMock.onCall(0).returns(
      new ValidationResult([documentError]),
    );

    const result = validateSTPacketDocuments(rawStateTransition, dataContract);

    expectValidationError(result, ConsensusError, 1);

    const [error] = result.getErrors();

    expect(error).to.equal(documentError);

    expect(validateDocumentMock.callCount).to.equal(5);

    documents.forEach((document) => {
      expect(validateDocumentMock).to.have.been.calledWith(
        document.toJSON(),
        dataContract,
        { action: document.getAction() },
      );
    });

    expect(findDuplicateDocumentsByIdMock).to.not.be.called();
    expect(findDuplicateDocumentsByIndicesMock).to.not.be.called();
  });

  it('should return invalid result if there are duplicate Documents with the same ID', () => {
    const duplicateDocuments = [documents[0].toJSON()];

    findDuplicateDocumentsByIdMock.returns(duplicateDocuments);

    const result = validateSTPacketDocuments(rawStateTransition, dataContract);

    expectValidationError(result, DuplicateDocumentsError);

    const [error] = result.getErrors();

    expect(error.getDuplicatedDocuments()).to.deep.equal(duplicateDocuments);

    expect(validateDocumentMock.callCount).to.equal(5);

    documents.forEach((document) => {
      expect(validateDocumentMock).to.have.been.calledWith(
        document.toJSON(),
        dataContract,
        { action: document.getAction() },
      );
    });

    expect(findDuplicateDocumentsByIdMock).to.be.called(documents);
    expect(findDuplicateDocumentsByIndicesMock).to.be.calledOnceWith(documents, dataContract);
  });

  it('should return invalid result if there are duplicate unique index values', () => {
    const duplicateDocuments = [documents[1].toJSON()];

    findDuplicateDocumentsByIndicesMock.returns(duplicateDocuments);

    const result = validateSTPacketDocuments(rawStateTransition, dataContract);

    expectValidationError(result, DuplicateDocumentsError);

    const [error] = result.getErrors();

    expect(error.getDuplicatedDocuments()).to.deep.equal(duplicateDocuments);

    expect(validateDocumentMock.callCount).to.equal(5);

    documents.forEach((document) => {
      expect(validateDocumentMock).to.have.been.calledWith(
        document.toJSON(),
        dataContract,
        { action: document.getAction() },
      );
    });

    expect(findDuplicateDocumentsByIdMock).to.have.been.calledOnceWith(documents);
    expect(findDuplicateDocumentsByIndicesMock).to.be.calledOnceWith(documents, dataContract);
  });

  it('should return invalid result if there are documents with different User IDs', () => {
    const differentUserId = '86b273ff86b273ff86b273ff86b273ff86b273ff86b273ff86b273ff86b273ff';

    documents[0].userId = differentUserId;
    rawStateTransition.documents[0].$userId = differentUserId;

    const result = validateSTPacketDocuments(rawStateTransition, dataContract);

    expectValidationError(result, STContainsDocumentsFromDifferentUsersError);

    const [error] = result.getErrors();

    expect(error.getRawDocuments()).to.deep.equal([
      documents[0].toJSON(),
      documents[1].toJSON(),
    ]);

    expect(validateDocumentMock.callCount).to.equal(5);

    documents.forEach((document) => {
      expect(validateDocumentMock).to.have.been.calledWith(
        document.toJSON(),
        dataContract,
        { action: document.getAction() },
      );
    });

    expect(findDuplicateDocumentsByIdMock).to.have.been.calledOnceWith(documents);
    expect(findDuplicateDocumentsByIndicesMock).to.be.calledOnceWith(documents, dataContract);
  });

  it('should return valid result if there are no duplicate Documents and they are valid', () => {
    const result = validateSTPacketDocuments(rawStateTransition, dataContract);

    expect(result).to.be.an.instanceOf(ValidationResult);
    expect(result.isValid()).to.be.true();

    expect(findDuplicateDocumentsByIdMock).to.have.been.calledOnceWith(documents);

    expect(validateDocumentMock.callCount).to.equal(5);

    documents.forEach((document) => {
      expect(validateDocumentMock).to.have.been.calledWith(
        document.toJSON(),
        dataContract,
        { action: document.getAction() },
      );
    });

    expect(findDuplicateDocumentsByIdMock).to.have.been.calledOnceWith(documents);
    expect(findDuplicateDocumentsByIndicesMock).to.be.calledOnceWith(documents, dataContract);
  });
});
