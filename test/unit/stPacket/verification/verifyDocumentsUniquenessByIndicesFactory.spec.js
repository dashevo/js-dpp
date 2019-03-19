const bs58 = require('bs58');

const verifyDocumentsUniquenessByIndicesFactory = require('../../../../lib/stPacket/verification/verifyDocumentsUniquenessByIndicesFactory');

const STPacket = require('../../../../lib/stPacket/STPacket');

const getDocumentsFixture = require('../../../../lib/test/fixtures/getDocumentsFixture');
const getDPContractFixture = require('../../../../lib/test/fixtures/getDPContractFixture');

const { expectValidationError } = require('../../../../lib/test/expect/expectError');
const createDataProviderMock = require('../../../../lib/test/mocks/createDataProviderMock');

const DuplicateDocumentError = require('../../../../lib/errors/DuplicateDocumentError');

function encodeToBase58(id) {
  const idBuffer = Buffer.from(id, 'hex');
  return bs58.encode(idBuffer);
}

describe('verifyDocumentsUniquenessByIndices', () => {
  let fetchDocumentsByDocumentsMock;
  let dataProviderMock;
  let verifyDocumentsUniquenessByIndices;
  let stPacket;
  let documents;
  let dpContract;
  let userId;

  beforeEach(function beforeEach() {
    ({ userId } = getDocumentsFixture);

    documents = getDocumentsFixture();
    dpContract = getDPContractFixture();

    stPacket = new STPacket(dpContract.getId());
    stPacket.setDocuments(documents);

    fetchDocumentsByDocumentsMock = this.sinonSandbox.stub();

    dataProviderMock = createDataProviderMock(this.sinonSandbox);
    dataProviderMock.fetchDocuments.resolves([]);

    verifyDocumentsUniquenessByIndices = verifyDocumentsUniquenessByIndicesFactory(
      fetchDocumentsByDocumentsMock,
      dataProviderMock,
    );
  });

  it('should return invalid result if Document has unique indices and there are duplicates', async () => {
    const [, , , william, leon] = documents;

    const indicesDefinition = dpContract.getDocumentSchema(william.getType()).indices;

    dataProviderMock.fetchDocuments.resolves([]);

    dataProviderMock.fetchDocuments
      .withArgs(
        stPacket.getDPContractId(),
        william.getType(),
        {
          where: {
            'document.$userId': william.get('$userId'),
            'document.firstName': william.get('firstName'),
            _id: { $ne: encodeToBase58(william.getId()) },
          },
        },
      )
      .resolves([leon.toJSON()]);

    dataProviderMock.fetchDocuments
      .withArgs(
        stPacket.getDPContractId(),
        william.getType(),
        {
          where: {
            'document.$userId': william.get('$userId'),
            'document.lastName': william.get('lastName'),
            _id: { $ne: encodeToBase58(william.getId()) },
          },
        },
      )
      .resolves([leon.toJSON()]);

    dataProviderMock.fetchDocuments
      .withArgs(
        stPacket.getDPContractId(),
        leon.getType(),
        {
          where: {
            'document.$userId': leon.get('$userId'),
            'document.firstName': leon.get('firstName'),
            _id: { $ne: encodeToBase58(leon.getId()) },
          },
        },
      )
      .resolves([william.toJSON()]);

    dataProviderMock.fetchDocuments
      .withArgs(
        stPacket.getDPContractId(),
        leon.getType(),
        {
          where: {
            'document.$userId': leon.get('$userId'),
            'document.lastName': leon.get('lastName'),
            _id: { $ne: encodeToBase58(leon.getId()) },
          },
        },
      )
      .resolves([william.toJSON()]);

    const result = await verifyDocumentsUniquenessByIndices(stPacket, userId, dpContract);

    expectValidationError(result, DuplicateDocumentError, 4);

    const errors = result.getErrors();

    expect(errors.map(e => e.getDocument())).to.have.deep.members([
      william,
      william,
      leon,
      leon,
    ]);

    expect(errors.map(e => e.getIndexDefinition())).to.have.deep.members([
      indicesDefinition[0],
      indicesDefinition[1],
      indicesDefinition[0],
      indicesDefinition[1],
    ]);
  });
});
