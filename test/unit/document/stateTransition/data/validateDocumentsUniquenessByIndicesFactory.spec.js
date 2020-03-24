const verifyDocumentsUniquenessByIndicesFactory = require('../../../../../lib/document/stateTransition/validation/data/validateDocumentsUniquenessByIndicesFactory');

const getDocumentsFixture = require('../../../../../lib/test/fixtures/getDocumentsFixture');
const getContractFixture = require('../../../../../lib/test/fixtures/getDataContractFixture');
const getDocumentTransitionsFixture = require('../../../../../lib/test/fixtures/getDocumentTransitionsFixture');

const { expectValidationError } = require('../../../../../lib/test/expect/expectError');
const createDataProviderMock = require('../../../../../lib/test/mocks/createDataProviderMock');

const ValidationResult = require('../../../../../lib/validation/ValidationResult');

const DuplicateDocumentError = require('../../../../../lib/errors/DuplicateDocumentError');

describe('validateDocumentsUniquenessByIndices', () => {
  let dataProviderMock;
  let validateDocumentsUniquenessByIndices;
  let documents;
  let transitions;
  let dataContract;
  let ownerId;

  beforeEach(function beforeEach() {
    ({ ownerId } = getDocumentsFixture);

    documents = getDocumentsFixture();
    transitions = getDocumentTransitionsFixture({
      create: documents,
    });
    dataContract = getContractFixture();

    dataProviderMock = createDataProviderMock(this.sinonSandbox);
    dataProviderMock.fetchDocuments.resolves([]);

    validateDocumentsUniquenessByIndices = verifyDocumentsUniquenessByIndicesFactory(
      dataProviderMock,
    );
  });

  it('should return valid result if Documents have no unique indices');

  it('should return valid result if Document has unique indices and there are no duplicates', async () => {
    const [, , , william] = documents;

    dataProviderMock.fetchDocuments
      .withArgs(
        dataContract.getId(),
        william.getType(),
        {
          where: [
            ['$ownerId', '==', ownerId],
            ['firstName', '==', william.get('firstName')],
          ],
        },
      )
      .resolves([william]);

    dataProviderMock.fetchDocuments
      .withArgs(
        dataContract.getId(),
        william.getType(),
        {
          where: [
            ['$ownerId', '==', ownerId],
            ['lastName', '==', william.get('lastName')],
          ],
        },
      )
      .resolves([william]);

    const result = await validateDocumentsUniquenessByIndices(ownerId, transitions, dataContract);

    expect(result).to.be.an.instanceOf(ValidationResult);
    expect(result.isValid()).to.be.true();
  });

  it('should return invalid result if Document has unique indices and there are duplicates', async () => {
    const [, , , william, leon] = documents;

    const indicesDefinition = dataContract.getDocumentSchema(william.getType()).indices;

    dataProviderMock.fetchDocuments
      .withArgs(
        dataContract.getId(),
        william.getType(),
        {
          where: [
            ['$ownerId', '==', ownerId],
            ['firstName', '==', william.get('firstName')],
          ],
        },
      )
      .resolves([leon]);

    dataProviderMock.fetchDocuments
      .withArgs(
        dataContract.getId(),
        william.getType(),
        {
          where: [
            ['$ownerId', '==', ownerId],
            ['lastName', '==', william.get('lastName')],
          ],
        },
      )
      .resolves([leon]);

    dataProviderMock.fetchDocuments
      .withArgs(
        dataContract.getId(),
        leon.getType(),
        {
          where: [
            ['$ownerId', '==', ownerId],
            ['firstName', '==', leon.get('firstName')],
          ],
        },
      )
      .resolves([william]);

    dataProviderMock.fetchDocuments
      .withArgs(
        dataContract.getId(),
        leon.getType(),
        {
          where: [
            ['$ownerId', '==', ownerId],
            ['lastName', '==', leon.get('lastName')],
          ],
        },
      )
      .resolves([william]);

    const result = await validateDocumentsUniquenessByIndices(ownerId, transitions, dataContract);

    expectValidationError(result, DuplicateDocumentError, 4);

    const errors = result.getErrors();

    expect(errors.map((e) => e.getDocumentTransition())).to.have.deep.members([
      transitions[3],
      transitions[3],
      transitions[4],
      transitions[4],
    ]);

    expect(errors.map((e) => e.getIndexDefinition())).to.have.deep.members([
      indicesDefinition[0],
      indicesDefinition[1],
      indicesDefinition[0],
      indicesDefinition[1],
    ]);
  });
});
