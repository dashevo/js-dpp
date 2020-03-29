const Document = require('../../../../lib/document/Document');
const DocumentsBatchTransition = require(
  '../../../../lib/document/stateTransition/DocumentsBatchTransition',
);

const applyDocumentsBatchTransition = require(
  '../../../../lib/document/stateTransition/applyDocumentsBatchTransition',
);

const getDocumentsFixture = require('../../../../lib/test/fixtures/getDocumentsFixture');
const getDocumentTransitionsFixture = require(
  '../../../../lib/test/fixtures/getDocumentTransitionsFixture',
);

const DocumentNotProvidedError = require('../../../../lib/document/errors/DocumentNotProvidedError');
const DocumentAlreadyExistsError = require('../../../../lib/document/errors/DocumentAlreadyExistsError');

describe('applyDocumentsBatchTransition', () => {
  let documents;
  let documentTransitions;
  let contractId;
  let ownerId;
  let replaceDocument;
  let stateTransition;
  let documentsFixture;

  beforeEach(() => {
    documentsFixture = getDocumentsFixture();

    contractId = getDocumentsFixture.dataContract.getId();
    ownerId = getDocumentsFixture.ownerId;

    replaceDocument = new Document({
      ...documentsFixture[1].toJSON(),
      lastName: 'NotSoShiny',
    });

    documents = [replaceDocument, documentsFixture[2]];

    documentTransitions = getDocumentTransitionsFixture({
      create: [documentsFixture[0]],
      replace: [documents[0]],
      delete: [documents[1]],
    });

    stateTransition = new DocumentsBatchTransition({
      contractId,
      ownerId,
      transitions: documentTransitions.map((t) => t.toJSON()),
    });
  });

  it('should throw an error if document already exists', () => {
    const createDocumentTransition = documentTransitions[0];

    const [existingDocument] = documents;
    existingDocument.id = createDocumentTransition.getId();

    try {
      applyDocumentsBatchTransition(stateTransition, {
        [existingDocument.getId()]: existingDocument,
      });
      expect.fail('Error was not thrown');
    } catch (e) {
      expect(e).to.be.an.instanceOf(DocumentAlreadyExistsError);
      expect(e.getDocumentTransition()).to.deep.equal(createDocumentTransition);
    }
  });

  it('should throw an error if document was not provided for a replacement', () => {
    const replaceDocumentTransition = documentTransitions[1];
    try {
      applyDocumentsBatchTransition(stateTransition, {});
      expect.fail('Error was not thrown');
    } catch (e) {
      expect(e).to.be.an.instanceOf(DocumentNotProvidedError);
      expect(e.getDocumentTransition()).to.deep.equal(replaceDocumentTransition);
    }
  });

  it('should throw an error if document was not provided for a deletion', () => {
    const deleteDocumentTransition = documentTransitions[2];
    try {
      applyDocumentsBatchTransition(stateTransition, {
        [documents[0].getId()]: documents[0],
      });
      expect.fail('Error was not thrown');
    } catch (e) {
      expect(e).to.be.an.instanceOf(DocumentNotProvidedError);
      expect(e.getDocumentTransition()).to.deep.equal(deleteDocumentTransition);
    }
  });

  it('should return a map with documents ids and a document as result of an apply method', () => {
    const [createDocumentTransition] = documentTransitions;

    const resultingReplacedDocument = new Document({
      ...replaceDocument.toJSON(),
      $revision: 2,
    });

    const result = applyDocumentsBatchTransition(
      stateTransition, documents.reduce((acc, document) => (
        {
          ...acc,
          [document.getId()]: document,
        }
      ), {}),
    );

    expect(result).to.deep.equal({
      [documents[1].getId()]: null, // delete document
      [documents[0].getId()]: resultingReplacedDocument,
      [createDocumentTransition.getId()]: documentsFixture[0],
    });
  });
});
