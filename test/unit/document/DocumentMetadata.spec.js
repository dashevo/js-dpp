const DocumentMetadata = require('../../../lib/document/DocumentMetadata');

describe('DocumentMetadata', () => {
  let userId;
  let reference;
  let rawDocumentMetadata;
  let documentMetadata;

  beforeEach(() => {
    userId = 'test';

    reference = {
      blockHash: 'someBlockHash',
      blockHeight: 42,
      stHeaderHash: 'someHeaderHash',
      stPacketHash: 'somePacketHash',
    };

    rawDocumentMetadata = {
      userId,
      reference,
    };

    documentMetadata = new DocumentMetadata(rawDocumentMetadata);
  });

  describe('constructor', () => {
    it('should create DocumentMetadata with $userId if present', () => {
      expect(documentMetadata.userId).to.equal(userId);
    });

    it('should create DocumentMetadata with `reference` if present', () => {
      expect(documentMetadata.reference).to.deep.equal(reference);
    });
  });

  describe('#getUserId', () => {
    it('should return user ID', () => {
      expect(documentMetadata.getUserId()).to.equal(userId);
    });
  });

  describe('#getReference', () => {
    it('should return reference', () => {
      expect(documentMetadata.getReference()).to.deep.equal(reference);
    });
  });

  describe('#toJSON', () => {
    it('should return DocumentMetadata as plain JS object', () => {
      expect(documentMetadata.toJSON()).to.deep.equal(rawDocumentMetadata);
    });
  });
});
