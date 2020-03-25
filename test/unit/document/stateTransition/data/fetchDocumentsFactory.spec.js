const getDocumentsFixture = require('../../../../../lib/test/fixtures/getDocumentsFixture');
const getDocumentTransitionsFixture = require('../../../../../lib/test/fixtures/getDocumentTransitionsFixture');

const fetchDocumentsFactory = require('../../../../../lib/document/stateTransition/validation/data/fetchDocumentsFactory');

const createDataProviderMock = require('../../../../../lib/test/mocks/createDataProviderMock');

describe('fetchDocumentsFactory', () => {
  let fetchDocuments;
  let dataProviderMock;
  let documentTransitions;
  let documents;
  let dataContract;

  beforeEach(function beforeEach() {
    dataProviderMock = createDataProviderMock(this.sinonSandbox);

    fetchDocuments = fetchDocumentsFactory(dataProviderMock);

    documents = getDocumentsFixture();
    documentTransitions = getDocumentTransitionsFixture({
      create: documents,
    });
    dataContract = getDocumentsFixture.dataContract;
  });

  it('should fetch specified Documents using DataProvider', async () => {
    dataProviderMock.fetchDocuments.withArgs(
      dataContract.getId(),
      documentTransitions[0].getType(),
    ).resolves([documents[0]]);

    dataProviderMock.fetchDocuments.withArgs(
      dataContract.getId(),
      documentTransitions[1].getType(),
    ).resolves([documents[1], documents[2]]);

    dataProviderMock.fetchDocuments.withArgs(
      dataContract.getId(),
      documentTransitions[3].getType(),
    ).resolves([documents[3], documents[4]]);

    const fetchedDocuments = await fetchDocuments(dataContract.getId(), documentTransitions);

    expect(dataProviderMock.fetchDocuments).to.have.been.calledThrice();

    const callArgsOne = [
      dataContract.getId(),
      documents[0].getType(),
      {
        where: [
          ['$id', 'in', [documents[0].getId()]],
        ],
      },
    ];

    const callArgsTwo = [
      dataContract.getId(),
      documents[1].getType(),
      {
        where: [
          ['$id', 'in', [
            documents[1].getId(),
            documents[2].getId(),
          ]],
        ],
      },
    ];

    const callArgsThree = [
      dataContract.getId(),
      documents[3].getType(),
      {
        where: [
          ['$id', 'in', [
            documents[3].getId(),
            documents[4].getId(),
          ]],
        ],
      },
    ];

    const callsArgs = [];
    for (let i = 0; i < dataProviderMock.fetchDocuments.callCount; i++) {
      const call = dataProviderMock.fetchDocuments.getCall(i);
      callsArgs.push(call.args);
    }

    expect(callsArgs).to.have.deep.members([
      callArgsOne,
      callArgsTwo,
      callArgsThree,
    ]);

    expect(fetchedDocuments).to.deep.equal(documents);
  });
});
