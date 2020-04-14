const Document = require('../../../../lib/document/Document');
const DocumentsBatchTransition = require(
  '../../../../lib/document/stateTransition/DocumentsBatchTransition',
);

const applyDocumentsBatchTransitionFactory = require(
  '../../../../lib/document/stateTransition/applyDocumentsBatchTransitionFactory',
);

const getDocumentsFixture = require('../../../../lib/test/fixtures/getDocumentsFixture');
const getDocumentTransitionsFixture = require(
  '../../../../lib/test/fixtures/getDocumentTransitionsFixture',
);

const DocumentNotProvidedError = require('../../../../lib/document/errors/DocumentNotProvidedError');

const createStateRepositoryMock = require('../../../../lib/test/mocks/createStateRepositoryMock');

describe('applyDocumentsBatchTransitionFactory', () => {
  let documentTransitions;
  let contractId;
  let ownerId;
  let replaceDocument;
  let stateTransition;
  let documentsFixture;
  let applyDocumentsBatchTransition;
  let stateRepositoryMock;
  let fetchDocumentsMock;
  let createDocument;

  beforeEach(function beforeEach() {
    documentsFixture = getDocumentsFixture();

    contractId = getDocumentsFixture.dataContract.getId();
    ownerId = getDocumentsFixture.ownerId;

    replaceDocument = new Document({
      ...documentsFixture[1].toJSON(),
      lastName: 'NotSoShiny',
      $protocolVersion: '0.0.1',
    });

    [createDocument] = documentsFixture;

    documentTransitions = getDocumentTransitionsFixture({
      create: [createDocument],
      replace: [replaceDocument],
      delete: [documentsFixture[2]],
    });

    stateTransition = new DocumentsBatchTransition({
      contractId,
      ownerId,
      transitions: documentTransitions.map((t) => t.toJSON()),
    });

    stateRepositoryMock = createStateRepositoryMock(this.sinonSandbox);

    fetchDocumentsMock = this.sinonSandbox.stub();

    fetchDocumentsMock.resolves([
      new Document(documentsFixture[1].toJSON()),
    ]);

    applyDocumentsBatchTransition = applyDocumentsBatchTransitionFactory(
      stateRepositoryMock,
      fetchDocumentsMock,
    );
  });

  it('should call `store`, `replace` and `remove` functions for specific type of transitions', async () => {
    await applyDocumentsBatchTransition(stateTransition);

    const replaceDocumentTransition = documentTransitions[1];

    expect(fetchDocumentsMock).to.have.been.calledOnceWithExactly(
      stateTransition.getDataContractId(), [replaceDocumentTransition],
    );

    expect(stateRepositoryMock.storeDocument).to.have.been.calledTwice();
    expect(stateRepositoryMock.storeDocument.getCall(0).args).to.deep.equal([
      createDocument,
    ]);

    const replaceDocumentCall = new Document(replaceDocument.toJSON());
    replaceDocumentCall.setRevision(2);

    expect(stateRepositoryMock.storeDocument.getCall(1).args).to.deep.equal([
      replaceDocumentCall,
    ]);

    expect(stateRepositoryMock.removeDocument).to.have.been.calledOnceWithExactly(
      stateTransition.getDataContractId(),
      documentTransitions[2].getType(),
      documentTransitions[2].getId(),
    );
  });

  it('should throw an error if document was not provided for a replacement', async () => {
    fetchDocumentsMock.resolves([]);

    const replaceDocumentTransition = documentTransitions[1];

    try {
      await applyDocumentsBatchTransition(stateTransition);
      expect.fail('Error was not thrown');
    } catch (e) {
      expect(e).to.be.an.instanceOf(DocumentNotProvidedError);
      expect(e.getDocumentTransition()).to.deep.equal(replaceDocumentTransition);
    }
  });
});
