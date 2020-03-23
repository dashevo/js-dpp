const AbstractDocumentTransition = require('../../../../../lib/document/stateTransition/documentTransition/AbstractDocumentTransition');

const validateDocumentsSTDataFactory = require('../../../../../lib/document/stateTransition/validation/data/validateDocumentsSTDataFactory');

const Document = require('../../../../../lib/document/Document');
const DocumentsBatchTransition = require('../../../../../lib/document/stateTransition/DocumentsBatchTransition');

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
const DocumentOwnerIdMismatchError = require('../../../../../lib/errors/DocumentOwnerIdMismatchError');

describe('validateDocumentsSTDataFactory', () => {
  let validateDocumentsSTData;
  let fetchDocumentsMock;
  let stateTransition;
  let documents;
  let dataContract;
  let ownerId;
  let validateDocumentsUniquenessByIndicesMock;
  let dataProviderMock;
  let executeDataTriggersMock;
  let fetchAndValidateDataContractMock;

  beforeEach(function beforeEach() {
    ({ ownerId } = getDocumentsFixture);

    documents = getDocumentsFixture();
    dataContract = getContractFixture();

    stateTransition = new DocumentsBatchTransition(documents);

    dataProviderMock = createDataProviderMock(this.sinonSandbox);
    dataProviderMock.fetchDataContract.resolves(dataContract);

    fetchDocumentsMock = this.sinonSandbox.stub().resolves([]);

    executeDataTriggersMock = this.sinonSandbox.stub();

    validateDocumentsUniquenessByIndicesMock = this.sinonSandbox.stub();
    validateDocumentsUniquenessByIndicesMock.resolves(new ValidationResult());

    const dataContractValidationResult = new ValidationResult();
    dataContractValidationResult.setData(dataContract);

    fetchAndValidateDataContractMock = this.sinonSandbox.stub()
      .resolves(dataContractValidationResult);

    validateDocumentsSTData = validateDocumentsSTDataFactory(
      dataProviderMock,
      fetchDocumentsMock,
      validateDocumentsUniquenessByIndicesMock,
      executeDataTriggersMock,
      fetchAndValidateDataContractMock,
    );
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

    expect(fetchDocumentsMock).to.have.not.been.called();
    expect(validateDocumentsUniquenessByIndicesMock).to.have.not.been.called();
    expect(executeDataTriggersMock).to.have.not.been.called();
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

    expect(validateDocumentsUniquenessByIndicesMock).to.have.not.been.called();
    expect(executeDataTriggersMock).to.have.not.been.called();
  });

  it('should return invalid result if Document with action "update" is not present', async () => {
    documents[0].setAction(AbstractDocumentTransition.ACTIONS.REPLACE);

    const result = await validateDocumentsSTData(stateTransition);

    expectValidationError(result, DocumentNotFoundError);

    const [error] = result.getErrors();

    expect(error.getDocument()).to.equal(documents[0]);

    expect(fetchAndValidateDataContractMock).to.have.been.calledOnceWithExactly(documents[0]);

    expect(fetchDocumentsMock).to.have.been.calledOnceWithExactly(documents);

    expect(validateDocumentsUniquenessByIndicesMock).to.have.not.been.called();
    expect(executeDataTriggersMock).to.have.not.been.called();
  });

  it('should return invalid result if Document with action "delete" is not present', async () => {
    documents[0].setData({});
    documents[0].setAction(AbstractDocumentTransition.ACTIONS.DELETE);

    const result = await validateDocumentsSTData(stateTransition);

    expectValidationError(result, DocumentNotFoundError);

    const [error] = result.getErrors();

    expect(error.getDocument()).to.equal(documents[0]);

    expect(fetchAndValidateDataContractMock).to.have.been.calledOnceWithExactly(documents[0]);

    expect(fetchDocumentsMock).to.have.been.calledOnceWithExactly(documents);

    expect(validateDocumentsUniquenessByIndicesMock).to.have.not.been.called();
    expect(executeDataTriggersMock).to.have.not.been.called();
  });

  it('should return invalid result if Document with action "update" has wrong revision', async () => {
    documents[0].setAction(AbstractDocumentTransition.ACTIONS.REPLACE);

    fetchDocumentsMock.resolves([documents[0]]);

    const result = await validateDocumentsSTData(stateTransition);

    expectValidationError(result, InvalidDocumentRevisionError);

    const [error] = result.getErrors();

    expect(error.getDocument()).to.equal(documents[0]);
    expect(error.getFetchedDocument()).to.equal(documents[0]);

    expect(fetchAndValidateDataContractMock).to.have.been.calledOnceWithExactly(documents[0]);

    expect(fetchDocumentsMock).to.have.been.calledOnceWithExactly(documents);

    expect(validateDocumentsUniquenessByIndicesMock).to.have.not.been.called();
    expect(executeDataTriggersMock).to.have.not.been.called();
  });

  it('should return invalid result if Document with action "update" has mismatch of ownerId with previous revision', async () => {
    documents[0].setAction(AbstractDocumentTransition.ACTIONS.REPLACE);

    const fetchedDocument = new Document(documents[0].toJSON());
    fetchedDocument.revision -= 1;
    fetchedDocument.ownerId = '5zcXZpTLWFwZjKjq3ME5KVavtZa9YUaZESVzrndehBhq';

    fetchDocumentsMock.resolves([fetchedDocument]);

    const result = await validateDocumentsSTData(stateTransition);

    expectValidationError(result, DocumentOwnerIdMismatchError);

    const [error] = result.getErrors();

    expect(error.getDocument()).to.equal(documents[0]);
    expect(error.getFetchedDocument()).to.equal(fetchedDocument);

    expect(fetchAndValidateDataContractMock).to.have.been.calledOnceWithExactly(documents[0]);

    expect(fetchDocumentsMock).to.have.been.calledOnceWithExactly(documents);

    expect(validateDocumentsUniquenessByIndicesMock).to.have.not.been.called();
    expect(executeDataTriggersMock).to.have.not.been.called();
  });

  it('should return invalid result if Document with action "delete" has wrong revision', async () => {
    documents[0].setData({});
    documents[0].setAction(AbstractDocumentTransition.ACTIONS.DELETE);

    fetchDocumentsMock.resolves([documents[0]]);

    const result = await validateDocumentsSTData(stateTransition);

    expectValidationError(result, InvalidDocumentRevisionError);

    const [error] = result.getErrors();

    expect(error.getDocument()).to.equal(documents[0]);

    expect(fetchAndValidateDataContractMock).to.have.been.calledOnceWithExactly(documents[0]);

    expect(fetchDocumentsMock).to.have.been.calledOnceWithExactly(documents);

    expect(validateDocumentsUniquenessByIndicesMock).to.have.not.been.called();
    expect(executeDataTriggersMock).to.have.not.been.called();
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

      expect(validateDocumentsUniquenessByIndicesMock).to.have.not.been.called();
      expect(executeDataTriggersMock).to.have.not.been.called();
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

    expect(validateDocumentsUniquenessByIndicesMock).to.have.been.calledOnceWithExactly(
      documents,
      dataContract,
    );
  });

  it('should return invalid result if data triggers execution failed', async () => {
    const dataTriggersExecutionContext = new DataTriggerExecutionContext(
      dataProviderMock,
      ownerId,
      dataContract,
    );

    const dataTriggerExecutionError = new DataTriggerExecutionError(
      documents[0],
      dataTriggersExecutionContext.getDataContract(),
      dataTriggersExecutionContext.getOwnerId(),
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

    expect(validateDocumentsUniquenessByIndicesMock).to.have.been.calledOnceWithExactly(
      documents,
      dataContract,
    );

    expect(executeDataTriggersMock).to.have.been.calledOnceWithExactly(
      documents,
      dataTriggersExecutionContext,
    );
  });

  it('should return valid result if Documents are valid', async () => {
    const fetchedDocuments = [
      new Document(documents[1].toJSON()),
      new Document(documents[2].toJSON()),
    ];

    fetchDocumentsMock.resolves(fetchedDocuments);

    documents[1].setAction(AbstractDocumentTransition.ACTIONS.REPLACE);
    documents[1].setRevision(2);

    documents[2].setData({});
    documents[2].setAction(AbstractDocumentTransition.ACTIONS.DELETE);
    documents[2].setRevision(2);

    const dataTriggersExecutionContext = new DataTriggerExecutionContext(
      dataProviderMock,
      ownerId,
      dataContract,
    );

    executeDataTriggersMock.resolves([
      new DataTriggerExecutionResult(),
    ]);

    const result = await validateDocumentsSTData(stateTransition);

    expect(result).to.be.an.instanceOf(ValidationResult);
    expect(result.isValid()).to.be.true();

    expect(fetchAndValidateDataContractMock).to.have.been.calledOnceWithExactly(documents[0]);

    expect(fetchDocumentsMock).to.have.been.calledOnceWithExactly(documents);

    expect(validateDocumentsUniquenessByIndicesMock).to.have.been.calledOnceWithExactly(
      documents.filter((d) => d.getAction() !== AbstractDocumentTransition.ACTIONS.DELETE),
      dataContract,
    );

    expect(executeDataTriggersMock).to.have.been.calledOnceWithExactly(
      documents,
      dataTriggersExecutionContext,
    );
  });
});
