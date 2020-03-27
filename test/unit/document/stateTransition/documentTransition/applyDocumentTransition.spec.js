const Document = require('../../../../../lib/document/Document');

const applyDocumentTransition = require(
  '../../../../../lib/document/stateTransition/documentTransition/applyDocumentTransition',
);

const getDocumentsFixture = require('../../../../../lib/test/fixtures/getDocumentsFixture');
const getDocumentTransitionsFixture = require(
  '../../../../../lib/test/fixtures/getDocumentTransitionsFixture',
);

const DocumentNotProvidedError = require('../../../../../lib/document/errors/DocumentNotProvidedError');
const DocumentAlreadyExistsError = require('../../../../../lib/document/errors/DocumentAlreadyExistsError');

describe('applyDocumentTransition', () => {
  let documents;
  let documentTransitions;
  let contractId;
  let ownerId;
  let replaceDocument;

  beforeEach(() => {
    documents = getDocumentsFixture();

    contractId = getDocumentsFixture.dataContract.getId();
    ownerId = getDocumentsFixture.ownerId;

    replaceDocument = new Document({
      ...documents[1].toJSON(),
      lastName: 'NotSoShiny',
    });

    documentTransitions = getDocumentTransitionsFixture({
      create: [documents[0]],
      replace: [replaceDocument],
      delete: [documents[2]],
    });
  });

  describe('create', () => {
    it('should throw an error if document already exists', () => {
      const createDocumentTransition = documentTransitions[0];
      try {
        applyDocumentTransition(contractId, ownerId, createDocumentTransition, documents[0]);
        expect.fail('Error was not thrown');
      } catch (e) {
        expect(e).to.be.an.instanceOf(DocumentAlreadyExistsError);
        expect(e.getDocumentTransition()).to.deep.equal(createDocumentTransition);
      }
    });

    it('should newly created document', () => {
      const createDocumentTransition = documentTransitions[0];
      const result = applyDocumentTransition(
        contractId, ownerId, createDocumentTransition, undefined,
      );

      expect(result.toJSON()).to.deep.equal(documents[0].toJSON());
    });
  });

  describe('replace', () => {
    it('should throw an error if document for deletion was not provided', () => {
      const replaceDocumentTransition = documentTransitions[1];
      try {
        applyDocumentTransition(contractId, ownerId, replaceDocumentTransition, undefined);
        expect.fail('Error was not thrown');
      } catch (e) {
        expect(e).to.be.an.instanceOf(DocumentNotProvidedError);
        expect(e.getDocumentTransition()).to.deep.equal(replaceDocumentTransition);
      }
    });

    it('should return an updated document', () => {
      const replaceDocumentTransition = documentTransitions[1];
      const result = applyDocumentTransition(
        contractId, ownerId, replaceDocumentTransition, documents[1],
      );

      expect(result.toJSON()).to.deep.equal({
        ...replaceDocument.toJSON(),
        $rev: 2,
      });
    });
  });

  describe('delete', () => {
    it('should throw an error if document for deletion was not provided', () => {
      const deleteDocumentTransition = documentTransitions[2];
      try {
        applyDocumentTransition(contractId, ownerId, deleteDocumentTransition, undefined);
        expect.fail('Error was not thrown');
      } catch (e) {
        expect(e).to.be.an.instanceOf(DocumentNotProvidedError);
        expect(e.getDocumentTransition()).to.deep.equal(deleteDocumentTransition);
      }
    });

    it('should return null as a result', () => {
      const deleteDocumentTransition = documentTransitions[2];
      const result = applyDocumentTransition(
        contractId, ownerId, deleteDocumentTransition, documents[2],
      );

      expect(result).to.be.null();
    });
  });
});
