const generateRandomId = require('../../../../../lib/test/utils/generateRandomId');

const enrichDataContractWithBaseSchema = require('../../../../../lib/dataContract/enrichDataContractWithBaseSchema');

const DocumentsBatchTransition = require('../../../../../lib/document/stateTransition/DocumentsBatchTransition');

const getDocumentTransitionsFixture = require('../../../../../lib/test/fixtures/getDocumentTransitionsFixture');
const getDocumentsFixture = require('../../../../../lib/test/fixtures/getDocumentsFixture');

const ValidationResult = require('../../../../../lib/validation/ValidationResult');

const validateDocumentsBatchTransitionStructureFactory = require('../../../../../lib/document/stateTransition/validation/structure/validateDocumentsBatchTransitionStructureFactory');

const { expectValidationError } = require('../../../../../lib/test/expect/expectError');

const createDataProviderMock = require('../../../../../lib/test/mocks/createDataProviderMock');

const DuplicateDocumentsError = require('../../../../../lib/errors/STDuplicateDocumentsError');
const STContainsDocumentsFromDifferentUsersError = require('../../../../../lib/errors/STContainsDocumentsFromDifferentUsersError');
const ConsensusError = require('../../../../../lib/errors/ConsensusError');
const InvalidDocumentTransitionIdError = require('../../../../../lib/errors/InvalidDocumentTransitionIdError');
const InvalidDocumentTransitionEntropyError = require('../../../../../lib/errors/InvalidDocumentTransitionEntropyError');
const InvalidIdentityPublicKeyTypeError = require('../../../../../lib/errors/InvalidIdentityPublicKeyTypeError');
const DataContractNotPresentError = require('../../../../../lib/errors/DataContractNotPresentError');

describe('validateDocumentsBatchTransitionStructureFactory', () => {
  let dataContract;
  let documents;
  let rawStateTransition;
  let findDuplicateDocumentsByIdMock;
  let findDuplicateDocumentsByIndicesMock;
  let validateStructure;
  let stateTransition;
  let validateStateTransitionSignatureMock;
  let ownerId;
  let validateIdentityExistenceMock;
  let dataProviderMock;
  let validatorMock;
  let enrichSpy;
  let transitions;

  beforeEach(function beforeEach() {
    documents = getDocumentsFixture();

    ownerId = getDocumentsFixture.ownerId;
    dataContract = getDocumentsFixture.dataContract;

    transitions = getDocumentTransitionsFixture({
      create: documents,
    });

    stateTransition = new DocumentsBatchTransition({
      ownerId,
      contractId: dataContract.getId(),
      transitions: transitions.map((t) => t.toJSON()),
    });
    rawStateTransition = stateTransition.toJSON();

    findDuplicateDocumentsByIdMock = this.sinonSandbox.stub().returns([]);
    findDuplicateDocumentsByIndicesMock = this.sinonSandbox.stub().returns([]);

    const dataContractValidationResult = new ValidationResult();
    dataContractValidationResult.setData(dataContract);

    const validateSignatureResult = new ValidationResult();
    validateStateTransitionSignatureMock = this.sinonSandbox.stub().resolves(
      validateSignatureResult,
    );

    validateIdentityExistenceMock = this.sinonSandbox.stub().resolves(
      new ValidationResult(),
    );

    dataProviderMock = createDataProviderMock(this.sinonSandbox);
    dataProviderMock.fetchDataContract.resolves(dataContract);

    validatorMock = {
      validate: this.sinonSandbox.stub(),
    };
    validatorMock.validate.returns(new ValidationResult());

    enrichSpy = this.sinonSandbox.spy(enrichDataContractWithBaseSchema);

    validateStructure = validateDocumentsBatchTransitionStructureFactory(
      findDuplicateDocumentsByIdMock,
      findDuplicateDocumentsByIndicesMock,
      validateStateTransitionSignatureMock,
      validateIdentityExistenceMock,
      dataProviderMock,
      validatorMock,
      enrichSpy,
    );
  });

  it('should return invalid result if data contract was not found', async () => {
    dataProviderMock.fetchDataContract.resolves(undefined);

    const result = await validateStructure(rawStateTransition);

    expectValidationError(result, DataContractNotPresentError);

    const [error] = result.getErrors();

    expect(error.getDataContractId()).to.equal(dataContract.getId());

    expect(dataProviderMock.fetchDataContract).to.be.calledOnceWithExactly(
      dataContract.getId(),
    );
  });

  it('should return invalid result if there are documents with wrong generated $id', async () => {
    const [firstTransition] = rawStateTransition.transitions;

    firstTransition.$id = generateRandomId();

    const result = await validateStructure(rawStateTransition);

    expectValidationError(result, InvalidDocumentTransitionIdError);

    const [error] = result.getErrors();

    expect(error.getRawDocumentTransition()).to.deep.equal(firstTransition);
  });

  it('should return invalid result if there are documents with wrong entropy', async () => {
    const [firstTransition] = rawStateTransition.transitions;

    firstTransition.$entropy = generateRandomId();

    const result = await validateStructure(rawStateTransition);

    expectValidationError(result, InvalidDocumentTransitionEntropyError);

    const [error] = result.getErrors();

    expect(error.getRawDocumentTransition()).to.deep.equal(firstTransition);
  });

  it('should return invalid result if document transitions are invalid', async () => {
    const dataContractError = new ConsensusError('error');
    const dataContractValidationResult = new ValidationResult([
      dataContractError,
    ]);

    fetchAndValidateDataContractMock.resolves(dataContractValidationResult);

    const result = await validateStructure(rawStateTransition);

    expectValidationError(result, ConsensusError, 1);

    const [error] = result.getErrors();

    expect(error).to.equal(dataContractError);

    expect(fetchAndValidateDataContractMock).to.be.calledOnceWith(documents[0].toJSON());
    expect(validateDocumentMock).to.not.be.called();
    expect(findDuplicateDocumentsByIdMock).to.not.be.called();
    expect(findDuplicateDocumentsByIndicesMock).to.not.be.called();
    expect(validateStateTransitionSignatureMock).to.not.be.called();
    expect(validateIdentityExistenceMock).to.not.be.called();
  });

  it('should return invalid result if Documents are invalid', async () => {
    const documentError = new ConsensusError('test');

    validateDocumentMock.onCall(0).returns(
      new ValidationResult([documentError]),
    );

    const result = await validateStructure(rawStateTransition);

    expectValidationError(result, ConsensusError, 1);

    const [error] = result.getErrors();

    expect(error).to.equal(documentError);

    expect(fetchAndValidateDataContractMock).to.be.calledOnceWith(documents[0].toJSON());
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
    expect(validateStateTransitionSignatureMock).to.not.be.called();
    expect(validateIdentityExistenceMock).to.not.be.called();
  });

  it('should return invalid result if there are duplicate Documents with the same ID', async () => {
    const duplicateDocuments = [documents[0].toJSON()];

    findDuplicateDocumentsByIdMock.returns(duplicateDocuments);

    const result = await validateStructure(rawStateTransition);

    expectValidationError(result, DuplicateDocumentsError);

    const [error] = result.getErrors();

    expect(error.getDuplicatedDocuments()).to.deep.equal(duplicateDocuments);

    expect(fetchAndValidateDataContractMock).to.be.calledOnceWith(documents[0].toJSON());
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
    expect(validateStateTransitionSignatureMock).to.be.not.called(stateTransition, ownerId);
    expect(validateIdentityExistenceMock).to.be.calledOnceWith(
      ownerId,
    );
  });

  it('should return invalid result if there are duplicate unique index values', async () => {
    const duplicateDocuments = [documents[1].toJSON()];

    findDuplicateDocumentsByIndicesMock.returns(duplicateDocuments);

    const result = await validateStructure(rawStateTransition);

    expectValidationError(result, DuplicateDocumentsError);

    const [error] = result.getErrors();

    expect(error.getDuplicatedDocuments()).to.deep.equal(duplicateDocuments);

    expect(fetchAndValidateDataContractMock).to.be.calledOnceWith(documents[0].toJSON());
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
    expect(validateStateTransitionSignatureMock).to.be.not.called(stateTransition, ownerId);
    expect(validateIdentityExistenceMock).to.be.calledOnceWith(
      ownerId,
    );
  });

  it('should return invalid result if there are documents with different User IDs', async () => {
    const differentOwnerId = generateRandomId();

    documents[0].ownerId = differentOwnerId;
    rawStateTransition.documents[0].$ownerId = differentOwnerId;

    stateTransition = new DocumentsBatchTransition(documents);

    const result = await validateStructure(rawStateTransition);

    expectValidationError(result, STContainsDocumentsFromDifferentUsersError);

    const [error] = result.getErrors();

    expect(error.getRawDocuments()).to.deep.equal([
      documents[0].toJSON(),
      documents[1].toJSON(),
    ]);

    expect(fetchAndValidateDataContractMock).to.be.calledOnceWith(documents[0].toJSON());
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
    expect(validateStateTransitionSignatureMock).to.be.not.called();
    expect(validateIdentityExistenceMock).to.be.calledOnceWith(
      differentOwnerId,
    );
  });

  it('should return invalid result with invalid signature', async () => {
    const type = 1;
    const validationError = new InvalidIdentityPublicKeyTypeError(type);

    const validateSignatureResult = new ValidationResult([
      validationError,
    ]);
    validateStateTransitionSignatureMock.resolves(
      validateSignatureResult,
    );

    const result = await validateStructure(rawStateTransition, dataContract);

    expect(result).to.be.an.instanceOf(ValidationResult);
    expect(result.isValid()).to.be.false();

    const [error] = result.getErrors();

    expect(error).to.equal(validationError);

    documents.forEach((document) => {
      expect(validateDocumentMock).to.have.been.calledWith(
        document.toJSON(),
        dataContract,
        { action: document.getAction() },
      );
    });

    expect(findDuplicateDocumentsByIdMock).to.have.been.calledOnceWith(documents);
    expect(findDuplicateDocumentsByIndicesMock).to.be.calledOnceWith(documents, dataContract);
    expect(validateStateTransitionSignatureMock).to.be.calledOnceWith(stateTransition, ownerId);
    expect(validateIdentityExistenceMock).to.be.calledOnceWith(
      ownerId,
    );
  });

  it('should return valid result', async () => {
    const result = await validateStructure(rawStateTransition, dataContract);

    expect(result).to.be.an.instanceOf(ValidationResult);
    expect(result.isValid()).to.be.true();

    expect(fetchAndValidateDataContractMock).to.be.calledOnceWith(documents[0].toJSON());
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
    expect(validateStateTransitionSignatureMock).to.be.calledOnceWith(stateTransition, ownerId);
    expect(validateIdentityExistenceMock).to.be.calledOnceWith(
      ownerId,
    );
  });
});
