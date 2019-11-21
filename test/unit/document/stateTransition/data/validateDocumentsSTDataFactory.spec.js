const { PrivateKey } = require('@dashevo/dashcore-lib');

const validateDocumentsSTDataFactory = require('../../../../../lib/document/stateTransition/validation/data/validateDocumentsSTDataFactory');
const Identity = require('../../../../../lib/identity/Identity');

const Document = require('../../../../../lib/document/Document');
const DocumentsStateTransition = require('../../../../../lib/document/stateTransition/DocumentsStateTransition');

const DataTriggerExecutionContext = require('../../../../../lib/dataTrigger/DataTriggerExecutionContext');
const DataTriggerExecutionError = require('../../../../../lib/errors/DataTriggerExecutionError');
const DataTriggerExecutionResult = require('../../../../../lib/dataTrigger/DataTriggerExecutionResult');

const getDocumentsFixture = require('../../../../../lib/test/fixtures/getDocumentsFixture');
const getContractFixture = require('../../../../../lib/test/fixtures/getDataContractFixture');
const createDataProviderMock = require('../../../../../lib/test/mocks/createDataProviderMock');

const ValidationResult = require('../../../../../lib/validation/ValidationResult');

const { expectValidationError } = require('../../../../../lib/test/expect/expectError');

const DocumentAlreadyPresentError = require('../../../../../lib/errors/DocumentAlreadyPresentError');
const DocumentNotFoundError = require('../../../../../lib/errors/DocumentNotFoundError');
const InvalidDocumentRevisionError = require('../../../../../lib/errors/InvalidDocumentRevisionError');
const ConsensusError = require('../../../../../lib/errors/ConsensusError');
const InvalidDocumentActionError = require('../../../../../lib/document/errors/InvalidDocumentActionError');
const InvalidStateTransitionSignatureError = require('../../../../../lib/errors/InvalidStateTransitionSignatureError');

const signatureTypes = require('../../../../../lib/stateTransition/signatureTypes');

describe('validateDocumentsSTDataFactory', () => {
  let validateDocumentsSTData;
  let fetchDocumentsMock;
  let stateTransition;
  let documents;
  let dataContract;
  let userId;
  let validateDocumentsUniquenessByIndicesMock;
  let dataProviderMock;
  let validateIdentityExistenceAndTypeMock;
  let executeDataTriggersMock;
  let fetchAndValidateDataContractMock;
  let rawIdentity;
  let signOptions;

  beforeEach(function beforeEach() {
    ({ userId } = getDocumentsFixture);

    documents = getDocumentsFixture();
    dataContract = getContractFixture();

    const privateKey = new PrivateKey();
    const publicKey = privateKey.toPublicKey().toBuffer().toString('base64');

    const getPublicKeyById = this.sinonSandbox.stub().returns({
      publicKey,
    });

    const publicKeyId = 1;

    rawIdentity = {
      id: userId,
      identityType: Identity.TYPES.APPLICATION,
      publicKeys: [
        {
          id: publicKeyId,
          publicKey,
          isEnabled: true,
        },
      ],
      getPublicKeyById,
    };

    signOptions = {
      id: publicKeyId,
      userId,
      type: signatureTypes.ECDSA,
      privateKey,
    };

    stateTransition = new DocumentsStateTransition(documents);
    stateTransition.sign(signOptions);

    dataProviderMock = createDataProviderMock(this.sinonSandbox);
    dataProviderMock.fetchDataContract.resolves(dataContract);
    dataProviderMock.fetchIdentity.resolves(rawIdentity);

    fetchDocumentsMock = this.sinonSandbox.stub().resolves([]);
    validateIdentityExistenceAndTypeMock = this.sinonSandbox.stub().resolves(
      new ValidationResult(),
    );
    executeDataTriggersMock = this.sinonSandbox.stub();

    validateDocumentsUniquenessByIndicesMock = this.sinonSandbox.stub();
    validateDocumentsUniquenessByIndicesMock.resolves(new ValidationResult());

    const dataContractValidationResult = new ValidationResult();
    dataContractValidationResult.setData(dataContract);

    fetchAndValidateDataContractMock = this.sinonSandbox.stub()
      .resolves(dataContractValidationResult);

    validateDocumentsSTData = validateDocumentsSTDataFactory(
      dataProviderMock,
      validateIdentityExistenceAndTypeMock,
      fetchDocumentsMock,
      validateDocumentsUniquenessByIndicesMock,
      executeDataTriggersMock,
      fetchAndValidateDataContractMock,
    );
  });

  it('should return invalid result if userId is not valid', async () => {
    const userError = new ConsensusError('error');

    validateIdentityExistenceAndTypeMock.resolves(new ValidationResult([userError]));

    const result = await validateDocumentsSTData(stateTransition);

    expectValidationError(result);

    const [error] = result.getErrors();

    expect(validateIdentityExistenceAndTypeMock).to.be.calledOnceWithExactly(
      userId, [Identity.TYPES.USER, Identity.TYPES.APPLICATION],
    );

    expect(error).to.equal(userError);

    expect(fetchAndValidateDataContractMock).to.have.not.been.called();
    expect(fetchDocumentsMock).to.have.not.been.called();
    expect(validateDocumentsUniquenessByIndicesMock).to.have.not.been.called();
    expect(executeDataTriggersMock).to.have.not.been.called();

    expect(dataProviderMock.fetchIdentity).to.not.be.called();
    expect(rawIdentity.getPublicKeyById).to.not.be.called();
  });

  it('should return invalid result if Data Contract is not present', async () => {
    const dataContractError = new ConsensusError('error');
    const dataContractValidationResult = new ValidationResult([
      dataContractError,
    ]);

    fetchAndValidateDataContractMock.resolves(dataContractValidationResult);

    const result = await validateDocumentsSTData(stateTransition);

    expectValidationError(result);

    const [error] = result.getErrors();

    expect(error).to.equal(dataContractError);

    expect(fetchAndValidateDataContractMock).to.have.been.calledOnceWithExactly(documents[0]);

    expect(validateIdentityExistenceAndTypeMock).to.be.calledOnceWithExactly(
      userId, [Identity.TYPES.USER, Identity.TYPES.APPLICATION],
    );

    expect(fetchDocumentsMock).to.have.not.been.called();
    expect(validateDocumentsUniquenessByIndicesMock).to.have.not.been.called();
    expect(executeDataTriggersMock).to.have.not.been.called();

    expect(dataProviderMock.fetchIdentity).to.not.be.called();
    expect(rawIdentity.getPublicKeyById).to.not.be.called();
  });

  it('should return invalid result if Document with action "create" is already present', async () => {
    fetchDocumentsMock.resolves([documents[0]]);

    const result = await validateDocumentsSTData(stateTransition);

    expectValidationError(result, DocumentAlreadyPresentError);

    const [error] = result.getErrors();

    expect(error.getDocument()).to.equal(documents[0]);
    expect(error.getFetchedDocument()).to.equal(documents[0]);

    expect(fetchAndValidateDataContractMock).to.have.been.calledOnceWithExactly(documents[0]);

    expect(fetchDocumentsMock).to.have.been.calledOnceWithExactly(documents);

    expect(validateIdentityExistenceAndTypeMock).to.be.calledOnceWithExactly(
      userId, [Identity.TYPES.USER, Identity.TYPES.APPLICATION],
    );

    expect(validateDocumentsUniquenessByIndicesMock).to.have.not.been.called();
    expect(executeDataTriggersMock).to.have.not.been.called();

    expect(dataProviderMock.fetchIdentity).to.not.be.called();
    expect(rawIdentity.getPublicKeyById).to.not.be.called();
  });

  it('should return invalid result if Document with action "update" is not present', async () => {
    documents[0].setAction(Document.ACTIONS.REPLACE);

    const result = await validateDocumentsSTData(stateTransition);

    expectValidationError(result, DocumentNotFoundError);

    const [error] = result.getErrors();

    expect(error.getDocument()).to.equal(documents[0]);

    expect(fetchAndValidateDataContractMock).to.have.been.calledOnceWithExactly(documents[0]);

    expect(fetchDocumentsMock).to.have.been.calledOnceWithExactly(documents);

    expect(validateIdentityExistenceAndTypeMock).to.be.calledOnceWithExactly(
      userId, [Identity.TYPES.USER, Identity.TYPES.APPLICATION],
    );

    expect(validateDocumentsUniquenessByIndicesMock).to.have.not.been.called();
    expect(executeDataTriggersMock).to.have.not.been.called();

    expect(dataProviderMock.fetchIdentity).to.not.be.called();
    expect(rawIdentity.getPublicKeyById).to.not.be.called();
  });

  it('should return invalid result if Document with action "delete" is not present', async () => {
    documents[0].setData({});
    documents[0].setAction(Document.ACTIONS.DELETE);

    const result = await validateDocumentsSTData(stateTransition);

    expectValidationError(result, DocumentNotFoundError);

    const [error] = result.getErrors();

    expect(error.getDocument()).to.equal(documents[0]);

    expect(fetchAndValidateDataContractMock).to.have.been.calledOnceWithExactly(documents[0]);

    expect(fetchDocumentsMock).to.have.been.calledOnceWithExactly(documents);

    expect(validateIdentityExistenceAndTypeMock).to.be.calledOnceWithExactly(
      userId, [Identity.TYPES.USER, Identity.TYPES.APPLICATION],
    );

    expect(validateDocumentsUniquenessByIndicesMock).to.have.not.been.called();
    expect(executeDataTriggersMock).to.have.not.been.called();

    expect(dataProviderMock.fetchIdentity).to.not.be.called();
    expect(rawIdentity.getPublicKeyById).to.not.be.called();
  });

  it('should return invalid result if Document with action "update" has wrong revision', async () => {
    documents[0].setAction(Document.ACTIONS.REPLACE);

    fetchDocumentsMock.resolves([documents[0]]);

    const result = await validateDocumentsSTData(stateTransition);

    expectValidationError(result, InvalidDocumentRevisionError);

    const [error] = result.getErrors();

    expect(error.getDocument()).to.equal(documents[0]);
    expect(error.getFetchedDocument()).to.equal(documents[0]);

    expect(fetchAndValidateDataContractMock).to.have.been.calledOnceWithExactly(documents[0]);

    expect(fetchDocumentsMock).to.have.been.calledOnceWithExactly(documents);

    expect(validateIdentityExistenceAndTypeMock).to.be.calledOnceWithExactly(
      userId, [Identity.TYPES.USER, Identity.TYPES.APPLICATION],
    );

    expect(validateDocumentsUniquenessByIndicesMock).to.have.not.been.called();
    expect(executeDataTriggersMock).to.have.not.been.called();

    expect(dataProviderMock.fetchIdentity).to.not.be.called();
    expect(rawIdentity.getPublicKeyById).to.not.be.called();
  });

  it('should return invalid result if Document with action "delete" has wrong revision', async () => {
    documents[0].setData({});
    documents[0].setAction(Document.ACTIONS.DELETE);

    fetchDocumentsMock.resolves([documents[0]]);

    const result = await validateDocumentsSTData(stateTransition);

    expectValidationError(result, InvalidDocumentRevisionError);

    const [error] = result.getErrors();

    expect(error.getDocument()).to.equal(documents[0]);

    expect(fetchAndValidateDataContractMock).to.have.been.calledOnceWithExactly(documents[0]);

    expect(fetchDocumentsMock).to.have.been.calledOnceWithExactly(documents);

    expect(validateIdentityExistenceAndTypeMock).to.be.calledOnceWithExactly(
      userId, [Identity.TYPES.USER, Identity.TYPES.APPLICATION],
    );

    expect(validateDocumentsUniquenessByIndicesMock).to.have.not.been.called();
    expect(executeDataTriggersMock).to.have.not.been.called();

    expect(dataProviderMock.fetchIdentity).to.not.be.called();
    expect(rawIdentity.getPublicKeyById).to.not.be.called();
  });

  it('should throw an error if Document has invalid action', async () => {
    documents[0].setAction(5);

    fetchDocumentsMock.resolves([documents[0]]);

    try {
      await validateDocumentsSTData(stateTransition);

      expect.fail('InvalidDocumentActionError should be thrown');
    } catch (e) {
      expect(e).to.be.an.instanceOf(InvalidDocumentActionError);
      expect(e.getDocument()).to.equal(documents[0]);

      expect(fetchAndValidateDataContractMock).to.have.been.calledOnceWithExactly(documents[0]);

      expect(fetchDocumentsMock).to.have.been.calledOnceWithExactly(documents);

      expect(validateIdentityExistenceAndTypeMock).to.be.calledOnceWithExactly(
        userId, [Identity.TYPES.USER, Identity.TYPES.APPLICATION],
      );

      expect(validateDocumentsUniquenessByIndicesMock).to.have.not.been.called();
      expect(executeDataTriggersMock).to.have.not.been.called();

      expect(dataProviderMock.fetchIdentity).to.not.be.called();
      expect(rawIdentity.getPublicKeyById).to.not.be.called();
    }
  });

  it('should return invalid result if there are duplicate documents according to unique indices', async () => {
    const duplicateDocumentsError = new ConsensusError('error');

    validateDocumentsUniquenessByIndicesMock.resolves(
      new ValidationResult([duplicateDocumentsError]),
    );

    const result = await validateDocumentsSTData(stateTransition);

    expectValidationError(result);

    const [error] = result.getErrors();

    expect(error).to.equal(duplicateDocumentsError);

    expect(fetchAndValidateDataContractMock).to.have.been.calledOnceWithExactly(documents[0]);

    expect(fetchDocumentsMock).to.have.been.calledOnceWithExactly(documents);

    expect(validateIdentityExistenceAndTypeMock).to.be.calledOnceWithExactly(
      userId, [Identity.TYPES.USER, Identity.TYPES.APPLICATION],
    );

    expect(validateDocumentsUniquenessByIndicesMock).to.have.been.calledOnceWithExactly(
      documents,
      dataContract,
    );

    expect(executeDataTriggersMock).to.have.not.been.called();

    expect(dataProviderMock.fetchIdentity).to.not.be.called();
    expect(rawIdentity.getPublicKeyById).to.not.be.called();
  });

  it('should return invalid result if data triggers execution failed', async () => {
    const dataTriggersExecutionContext = new DataTriggerExecutionContext(
      dataProviderMock,
      userId,
      dataContract,
    );

    const dataTriggerExecutionError = new DataTriggerExecutionError(
      documents[0],
      dataTriggersExecutionContext,
      new Error('error'),
    );

    executeDataTriggersMock.resolves([
      new DataTriggerExecutionResult([dataTriggerExecutionError]),
    ]);

    const result = await validateDocumentsSTData(stateTransition);

    expectValidationError(result, DataTriggerExecutionError);

    const [error] = result.getErrors();

    expect(error).to.equal(dataTriggerExecutionError);

    expect(fetchAndValidateDataContractMock).to.have.been.calledOnceWithExactly(documents[0]);

    expect(fetchDocumentsMock).to.have.been.calledOnceWithExactly(documents);

    expect(validateIdentityExistenceAndTypeMock).to.be.calledOnceWithExactly(
      userId, [Identity.TYPES.USER, Identity.TYPES.APPLICATION],
    );

    expect(validateDocumentsUniquenessByIndicesMock).to.have.been.calledOnceWithExactly(
      documents,
      dataContract,
    );

    expect(executeDataTriggersMock).to.have.been.calledOnceWithExactly(
      documents,
      dataTriggersExecutionContext,
    );

    expect(dataProviderMock.fetchIdentity).to.be.calledOnceWithExactly(stateTransition.getUserId());
    expect(rawIdentity.getPublicKeyById).to.be.calledOnceWithExactly(
      stateTransition.getPublicKeyId(),
    );
  });

  it('should return valid result if Documents and signature are valid', async () => {
    const fetchedDocuments = [
      new Document(documents[1].toJSON()),
      new Document(documents[2].toJSON()),
    ];

    fetchDocumentsMock.resolves(fetchedDocuments);

    documents[1].setAction(Document.ACTIONS.REPLACE);
    documents[1].setRevision(2);

    documents[2].setData({});
    documents[2].setAction(Document.ACTIONS.DELETE);
    documents[2].setRevision(2);

    const dataTriggersExecutionContext = new DataTriggerExecutionContext(
      dataProviderMock,
      userId,
      dataContract,
    );

    executeDataTriggersMock.resolves([
      new DataTriggerExecutionResult(),
    ]);

    stateTransition.sign(
      signOptions,
    );

    const result = await validateDocumentsSTData(stateTransition);

    expect(result).to.be.an.instanceOf(ValidationResult);
    expect(result.isValid()).to.be.true();

    expect(fetchAndValidateDataContractMock).to.have.been.calledOnceWithExactly(documents[0]);

    expect(fetchDocumentsMock).to.have.been.calledOnceWithExactly(documents);

    expect(validateIdentityExistenceAndTypeMock).to.be.calledOnceWithExactly(
      userId, [Identity.TYPES.USER, Identity.TYPES.APPLICATION],
    );

    expect(validateDocumentsUniquenessByIndicesMock).to.have.been.calledOnceWithExactly(
      documents,
      dataContract,
    );

    expect(executeDataTriggersMock).to.have.been.calledOnceWithExactly(
      documents,
      dataTriggersExecutionContext,
    );

    expect(dataProviderMock.fetchIdentity).to.be.calledOnceWithExactly(stateTransition.getUserId());
    expect(rawIdentity.getPublicKeyById).to.be.calledOnceWithExactly(
      stateTransition.getPublicKeyId(),
    );
  });

  it('should return invalid result on invalid signature', async () => {
    documents[1].setRevision(3);

    const result = await validateDocumentsSTData(stateTransition);

    expect(result).to.be.an.instanceOf(ValidationResult);
    expect(result.isValid()).to.be.false();

    expectValidationError(result, InvalidStateTransitionSignatureError);

    const [error] = result.getErrors();

    expect(error.getRawStateTransition()).to.equal(stateTransition);
    expect(dataProviderMock.fetchIdentity).to.be.calledOnceWithExactly(stateTransition.getUserId());
    expect(rawIdentity.getPublicKeyById).to.be.calledOnceWithExactly(
      stateTransition.getPublicKeyId(),
    );
  });

  it('should return invalid result if state transition is not signed', async () => {
    stateTransition = new DocumentsStateTransition(documents);

    const result = await validateDocumentsSTData(stateTransition);

    expect(result).to.be.an.instanceOf(ValidationResult);
    expect(result.isValid()).to.be.false();

    expectValidationError(result, InvalidStateTransitionSignatureError);

    const [error] = result.getErrors();

    expect(error.getRawStateTransition()).to.equal(stateTransition);
    expect(dataProviderMock.fetchIdentity).to.be.calledOnceWithExactly(stateTransition.getUserId());
    expect(rawIdentity.getPublicKeyById).to.be.calledOnceWithExactly(
      stateTransition.getPublicKeyId(),
    );
  });
});
