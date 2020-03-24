const generateRandomId = require('../../../../../lib/test/utils/generateRandomId');

const DocumentsBatchTransition = require('../../../../../lib/document/stateTransition/DocumentsBatchTransition');

const getContractFixture = require('../../../../../lib/test/fixtures/getDataContractFixture');
const getDocumentsFixture = require('../../../../../lib/test/fixtures/getDocumentsFixture');

const ValidationResult = require('../../../../../lib/validation/ValidationResult');

const validateDocumentsBatchTransitionStructure = require('../../../../../lib/document/stateTransition/validation/structure/validateDocumentsBatchTransitionStructure');

const { expectValidationError } = require('../../../../../lib/test/expect/expectError');

const createDataProviderMock = require('../../../../../lib/test/mocks/createDataProviderMock');

const DuplicateDocumentsError = require('../../../../../lib/errors/STDuplicateDocumentsError');
const STContainsDocumentsFromDifferentUsersError = require('../../../../../lib/errors/STContainsDocumentsFromDifferentUsersError');
const ConsensusError = require('../../../../../lib/errors/ConsensusError');
const STContainsDocumentsForDifferentDataContractsError = require('../../../../../lib/errors/STContainsDocumentsForDifferentDataContractsError');
const InvalidIdentityPublicKeyTypeError = require('../../../../../lib/errors/InvalidIdentityPublicKeyTypeError');

describe('validateDocumentsBatchTransitionStructure', () => {
  let dataContract;
  let documents;
  let rawStateTransition;
  let findDuplicateDocumentsByIdMock;
  let findDuplicateDocumentsByIndicesMock;
  let validateDocumentMock;
  let validateDocumentsSTStructure;
  let fetchAndValidateDataContractMock;
  let stateTransition;
  let validateStateTransitionSignatureMock;
  let ownerId;
  let validateIdentityExistenceMock;
  let dataProviderMock;

  beforeEach(function beforeEach() {
    dataContract = getContractFixture();
    documents = getDocumentsFixture();
    stateTransition = new DocumentsBatchTransition(documents);
    rawStateTransition = stateTransition.toJSON();

    findDuplicateDocumentsByIdMock = this.sinonSandbox.stub().returns([]);
    findDuplicateDocumentsByIndicesMock = this.sinonSandbox.stub().returns([]);
    validateDocumentMock = this.sinonSandbox.stub().returns(new ValidationResult());

    const dataContractValidationResult = new ValidationResult();
    dataContractValidationResult.setData(dataContract);

    fetchAndValidateDataContractMock = this.sinonSandbox.stub()
      .resolves(dataContractValidationResult);

    const validateSignatureResult = new ValidationResult();
    validateStateTransitionSignatureMock = this.sinonSandbox.stub().resolves(
      validateSignatureResult,
    );

    ([{ ownerId }] = documents);

    validateIdentityExistenceMock = this.sinonSandbox.stub().resolves(
      new ValidationResult(),
    );

    dataProviderMock = createDataProviderMock(this.sinonSandbox);

    validateDocumentsSTStructure = validateDocumentsBatchTransitionStructure(
      validateDocumentMock,
      findDuplicateDocumentsByIdMock,
      findDuplicateDocumentsByIndicesMock,
      fetchAndValidateDataContractMock,
      validateStateTransitionSignatureMock,
      validateIdentityExistenceMock,
      dataProviderMock,
      validatorMock,
      enrichDataContractWithBaseSchema,
    );
  });

  it('should return invalid result if ownerId is not valid', async () => {
    const userError = new ConsensusError('error');

    validateIdentityExistenceMock.resolves(new ValidationResult([userError]));

    const result = await validateDocumentsSTStructure(rawStateTransition);

    expectValidationError(result);

    const [error] = result.getErrors();

    expect(validateIdentityExistenceMock).to.be.calledOnceWithExactly(
      ownerId,
    );

    expect(error).to.equal(userError);

    expect(findDuplicateDocumentsByIdMock).to.be.called(documents);
    expect(findDuplicateDocumentsByIndicesMock).to.be.calledOnceWith(documents, dataContract);
    expect(validateStateTransitionSignatureMock).to.be.not.called(stateTransition, ownerId);
  });

  it('should return invalid result if actions and documents count are not equal', async () => {
    rawStateTransition.actions.push(3);

    const result = await validateDocumentsSTStructure(rawStateTransition);

    expectValidationError(result, MismatchSTDocumentsAndActionsError);

    const [error] = result.getErrors();

    expect(error.getRawStateTransition()).to.equal(rawStateTransition);

    expect(validateDocumentMock).to.not.be.called();
    expect(findDuplicateDocumentsByIdMock).to.not.be.called();
    expect(findDuplicateDocumentsByIndicesMock).to.not.be.called();
    expect(validateStateTransitionSignatureMock).to.not.be.called();
    expect(validateIdentityExistenceMock).to.not.be.called();
  });

  it('should return invalid result if there are documents with different $contractId', async () => {
    const [firstRawDocument, secondRawDocument, thirdRawDocument] = rawStateTransition.documents;

    secondRawDocument.$contractId = generateRandomId();
    delete thirdRawDocument.$contractId;

    const result = await validateDocumentsSTStructure(rawStateTransition);

    expectValidationError(result, STContainsDocumentsForDifferentDataContractsError);

    const [error] = result.getErrors();

    expect(error.getRawDocuments()).to.deep.equal([
      firstRawDocument,
      secondRawDocument,
      thirdRawDocument,
    ]);

    expect(fetchAndValidateDataContractMock).to.not.be.called();
    expect(validateDocumentMock).to.not.be.called();
    expect(findDuplicateDocumentsByIdMock).to.not.be.called();
    expect(findDuplicateDocumentsByIndicesMock).to.not.be.called();
    expect(validateStateTransitionSignatureMock).to.not.be.called();
    expect(validateIdentityExistenceMock).to.not.be.called();
  });

  it('should return invalid result if Documents are invalid', async () => {
    const dataContractError = new ConsensusError('error');
    const dataContractValidationResult = new ValidationResult([
      dataContractError,
    ]);

    fetchAndValidateDataContractMock.resolves(dataContractValidationResult);

    const result = await validateDocumentsSTStructure(rawStateTransition);

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

    const result = await validateDocumentsSTStructure(rawStateTransition);

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

    const result = await validateDocumentsSTStructure(rawStateTransition);

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

    const result = await validateDocumentsSTStructure(rawStateTransition);

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

    const result = await validateDocumentsSTStructure(rawStateTransition);

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

    const result = await validateDocumentsSTStructure(rawStateTransition, dataContract);

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
    const result = await validateDocumentsSTStructure(rawStateTransition, dataContract);

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
