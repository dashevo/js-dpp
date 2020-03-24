const generateRandomId = require('../../../../../lib/test/utils/generateRandomId');

const enrichDataContractWithBaseSchema = require('../../../../../lib/dataContract/enrichDataContractWithBaseSchema');

const DocumentsBatchTransition = require('../../../../../lib/document/stateTransition/DocumentsBatchTransition');

const getDocumentTransitionsFixture = require('../../../../../lib/test/fixtures/getDocumentTransitionsFixture');
const getDocumentsFixture = require('../../../../../lib/test/fixtures/getDocumentsFixture');

const ValidationResult = require('../../../../../lib/validation/ValidationResult');

const validateDocumentsBatchTransitionStructureFactory = require('../../../../../lib/document/stateTransition/validation/structure/validateDocumentsBatchTransitionStructureFactory');

const { expectValidationError } = require('../../../../../lib/test/expect/expectError');

const createDataProviderMock = require('../../../../../lib/test/mocks/createDataProviderMock');

const ConsensusError = require('../../../../../lib/errors/ConsensusError');
const JsonSchemaError = require('../../../../../lib/errors/JsonSchemaError');
const DuplicateDocumentTransitionsError = require('../../../../../lib/errors/DuplicateDocumentTransitionsError');
const InvalidDocumentTransitionIdError = require('../../../../../lib/errors/InvalidDocumentTransitionIdError');
const InvalidDocumentTransitionEntropyError = require('../../../../../lib/errors/InvalidDocumentTransitionEntropyError');
const InvalidIdentityPublicKeyTypeError = require('../../../../../lib/errors/InvalidIdentityPublicKeyTypeError');
const DataContractNotPresentError = require('../../../../../lib/errors/DataContractNotPresentError');

describe('validateDocumentsBatchTransitionStructureFactory', () => {
  let dataContract;
  let documents;
  let rawStateTransition;
  let findDuplicatesByIdMock;
  let findDuplicatesByIndicesMock;
  let validateStructure;
  let stateTransition;
  let validateStateTransitionSignatureMock;
  let ownerId;
  let validateIdentityExistenceMock;
  let dataProviderMock;
  let validatorMock;
  let enrichSpy;
  let documentTransitions;

  beforeEach(function beforeEach() {
    documents = getDocumentsFixture();

    ownerId = getDocumentsFixture.ownerId;
    dataContract = getDocumentsFixture.dataContract;

    documentTransitions = getDocumentTransitionsFixture({
      create: documents,
    });

    stateTransition = new DocumentsBatchTransition({
      ownerId,
      contractId: dataContract.getId(),
      transitions: documentTransitions.map((t) => t.toJSON()),
    });
    rawStateTransition = stateTransition.toJSON();

    findDuplicatesByIdMock = this.sinonSandbox.stub().returns([]);
    findDuplicatesByIndicesMock = this.sinonSandbox.stub().returns([]);

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
      findDuplicatesByIdMock,
      findDuplicatesByIndicesMock,
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

    expect(dataProviderMock.fetchDataContract).to.have.been.calledOnceWithExactly(
      dataContract.getId(),
    );

    expect(validatorMock.validate).to.have.not.been.called();
    expect(enrichSpy).to.have.not.been.called();
    expect(findDuplicatesByIdMock).to.have.not.been.called();
    expect(findDuplicatesByIndicesMock).to.have.not.been.called();
    expect(validateIdentityExistenceMock).to.have.not.been.called();
    expect(validateStateTransitionSignatureMock).to.have.not.been.called();
  });

  it('should return invalid result if there are documents with wrong generated $id', async () => {
    const [firstTransition] = rawStateTransition.transitions;

    firstTransition.$id = generateRandomId();

    const result = await validateStructure(rawStateTransition);

    expectValidationError(result, InvalidDocumentTransitionIdError);

    const [error] = result.getErrors();

    expect(error.getRawDocumentTransition()).to.deep.equal(firstTransition);

    expect(dataProviderMock.fetchDataContract).to.have.been.calledOnceWithExactly(
      dataContract.getId(),
    );
    expect(enrichSpy).to.have.been.calledThrice();
    expect(findDuplicatesByIdMock).to.have.been.calledOnceWithExactly(
      rawStateTransition.transitions,
    );
    expect(findDuplicatesByIndicesMock).to.have.been.calledOnceWithExactly(
      rawStateTransition.transitions, dataContract,
    );
    expect(validatorMock.validate.callCount).to.equal(documentTransitions.length);
    expect(validateIdentityExistenceMock).to.have.not.been.called();
    expect(validateStateTransitionSignatureMock).to.have.not.been.called();
  });

  it('should return invalid result if there are documents with wrong $entropy', async () => {
    const [firstTransition] = rawStateTransition.transitions;

    firstTransition.$entropy = generateRandomId();

    const result = await validateStructure(rawStateTransition);

    expect(result.isValid()).to.be.false();

    const [, error] = result.getErrors();

    expect(error).to.be.an.instanceOf(InvalidDocumentTransitionEntropyError);

    expect(error.getRawDocumentTransition()).to.deep.equal(firstTransition);

    expect(dataProviderMock.fetchDataContract).to.have.been.calledOnceWithExactly(
      dataContract.getId(),
    );
    expect(enrichSpy).to.have.been.calledThrice();
    expect(findDuplicatesByIdMock).to.have.been.calledOnceWithExactly(
      rawStateTransition.transitions,
    );
    expect(findDuplicatesByIndicesMock).to.have.been.calledOnceWithExactly(
      rawStateTransition.transitions, dataContract,
    );
    expect(validatorMock.validate.callCount).to.equal(documentTransitions.length);
    expect(validateIdentityExistenceMock).to.have.not.been.called();
    expect(validateStateTransitionSignatureMock).to.have.not.been.called();
  });

  it('should return invalid result if document documentTransitions schema invalid', async () => {
    const schemaError = new JsonSchemaError(new Error('test'));

    validatorMock.validate.onCall(0).returns(
      new ValidationResult([schemaError]),
    );

    const result = await validateStructure(rawStateTransition);

    expectValidationError(result, JsonSchemaError, 1);

    const [error] = result.getErrors();

    expect(error.message).to.equal('test');

    expect(dataProviderMock.fetchDataContract).to.have.been.calledOnceWithExactly(
      dataContract.getId(),
    );
    expect(enrichSpy).to.have.been.calledThrice();
    expect(findDuplicatesByIdMock).to.have.been.calledOnceWithExactly(
      rawStateTransition.transitions,
    );
    expect(findDuplicatesByIndicesMock).to.have.been.calledOnceWithExactly(
      rawStateTransition.transitions, dataContract,
    );
    expect(validatorMock.validate.callCount).to.equal(documentTransitions.length);
    expect(validateIdentityExistenceMock).to.have.not.been.called();
    expect(validateStateTransitionSignatureMock).to.have.not.been.called();
  });

  it('should return invalid result if there are duplicate document documentTransitions with the same ID', async () => {
    const duplicates = [documentTransitions[0].toJSON()];

    findDuplicatesByIdMock.returns(duplicates);

    const result = await validateStructure(rawStateTransition);

    expectValidationError(result, DuplicateDocumentTransitionsError);

    const [error] = result.getErrors();

    expect(error.getRawDocumentTransitions()).to.deep.equal(duplicates);

    expect(dataProviderMock.fetchDataContract).to.have.been.calledOnceWithExactly(
      dataContract.getId(),
    );
    expect(enrichSpy).to.have.been.calledThrice();
    expect(findDuplicatesByIdMock).to.have.been.calledOnceWithExactly(
      rawStateTransition.transitions,
    );
    expect(findDuplicatesByIndicesMock).to.have.been.calledOnceWithExactly(
      rawStateTransition.transitions, dataContract,
    );
    expect(validatorMock.validate.callCount).to.equal(documentTransitions.length);
    expect(validateIdentityExistenceMock).to.have.not.been.called();
    expect(validateStateTransitionSignatureMock).to.have.not.been.called();
  });

  it('should return invalid result if there are duplicate unique index values', async () => {
    const duplicates = [documentTransitions[1].toJSON()];

    findDuplicatesByIndicesMock.returns(duplicates);

    const result = await validateStructure(rawStateTransition);

    expectValidationError(result, DuplicateDocumentTransitionsError);

    const [error] = result.getErrors();

    expect(error.getRawDocumentTransitions()).to.deep.equal(duplicates);

    expect(dataProviderMock.fetchDataContract).to.have.been.calledOnceWithExactly(
      dataContract.getId(),
    );
    expect(enrichSpy).to.have.been.calledThrice();
    expect(findDuplicatesByIdMock).to.have.been.calledOnceWithExactly(
      rawStateTransition.transitions,
    );
    expect(findDuplicatesByIndicesMock).to.have.been.calledOnceWithExactly(
      rawStateTransition.transitions, dataContract,
    );
    expect(validatorMock.validate.callCount).to.equal(documentTransitions.length);
    expect(validateIdentityExistenceMock).to.have.not.been.called();
    expect(validateStateTransitionSignatureMock).to.have.not.been.called();
  });

  it('should return invalid result if there are no identity found', async () => {
    const validationResult = new ValidationResult();
    validationResult.addError(new ConsensusError('no identity'));

    validateIdentityExistenceMock.withArgs(rawStateTransition.ownerId)
      .resolves(validationResult);

    const result = await validateStructure(rawStateTransition);

    expectValidationError(result);

    const [error] = result.getErrors();

    expect(error.message).to.equal('no identity');

    expect(dataProviderMock.fetchDataContract).to.have.been.calledOnceWithExactly(
      dataContract.getId(),
    );
    expect(enrichSpy).to.have.been.calledThrice();
    expect(findDuplicatesByIdMock).to.have.been.calledOnceWithExactly(
      rawStateTransition.transitions,
    );
    expect(findDuplicatesByIndicesMock).to.have.been.calledOnceWithExactly(
      rawStateTransition.transitions, dataContract,
    );
    expect(validatorMock.validate.callCount).to.equal(documentTransitions.length);
    expect(validateIdentityExistenceMock).to.have.been.calledOnceWithExactly(ownerId);
    expect(validateStateTransitionSignatureMock).to.have.not.been.called();
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

    expect(dataProviderMock.fetchDataContract).to.have.been.calledOnceWithExactly(
      dataContract.getId(),
    );
    expect(enrichSpy).to.have.been.calledThrice();
    expect(findDuplicatesByIdMock).to.have.been.calledOnceWithExactly(
      rawStateTransition.transitions,
    );
    expect(findDuplicatesByIndicesMock).to.have.been.calledOnceWithExactly(
      rawStateTransition.transitions, dataContract,
    );
    expect(validatorMock.validate.callCount).to.equal(documentTransitions.length);
    expect(validateIdentityExistenceMock).to.have.been.calledOnceWithExactly(ownerId);
    expect(validateStateTransitionSignatureMock).to.have.been.calledOnceWithExactly(
      stateTransition, ownerId,
    );
  });

  it('should return valid result', async () => {
    const result = await validateStructure(rawStateTransition, dataContract);

    expect(result).to.be.an.instanceOf(ValidationResult);
    expect(result.isValid()).to.be.true();

    expect(dataProviderMock.fetchDataContract).to.have.been.calledOnceWithExactly(
      dataContract.getId(),
    );
    expect(enrichSpy).to.have.been.calledThrice();
    expect(findDuplicatesByIdMock).to.have.been.calledOnceWithExactly(
      rawStateTransition.transitions,
    );
    expect(findDuplicatesByIndicesMock).to.have.been.calledOnceWithExactly(
      rawStateTransition.transitions, dataContract,
    );
    expect(validatorMock.validate.callCount).to.equal(documentTransitions.length);
    expect(validateIdentityExistenceMock).to.have.been.calledOnceWithExactly(ownerId);
    expect(validateStateTransitionSignatureMock).to.have.been.calledOnceWithExactly(
      stateTransition, ownerId,
    );
  });
});
