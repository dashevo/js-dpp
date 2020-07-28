const Document = require('../../../lib/document/Document');

const getDocumentsFixture = require('../../../lib/test/fixtures/getDocumentsFixture');

describe('Document', () => {
  let document;
  let dataContract;

  beforeEach(() => {
    [document] = getDocumentsFixture().slice(-1);
    dataContract = getDocumentsFixture.dataContract;
  });

  describe('#toJSON', () => {
    it('should return raw document with encoded binary fields', () => {
      const result = document.toJSON();

      expect(result).to.deep.equal({
        $dataContractId: dataContract.getId(),
        $id: document.getId(),
        $ownerId: getDocumentsFixture.ownerId,
        $revision: 1,
        $type: 'withContentEncoding',
        binaryField: '\u0001\u0002\u0003\u0004',
      });
    });
  });

  describe('#toObject', () => {
    it('should return raw document with encoded binary fields as Buffer', () => {
      const result = document.toObject();

      expect(result).to.deep.equal({
        $dataContractId: dataContract.getId(),
        $id: document.getId(),
        $ownerId: getDocumentsFixture.ownerId,
        $revision: 1,
        $type: 'withContentEncoding',
        binaryField: Buffer.from([1, 2, 3, 4]),
      });
    });
  });

  describe('#fromJson', () => {
    it('should return new document from raw document in JSON format', () => {
      const result = Document.fromJson(document.toJSON(), dataContract);

      expect(result.toObject()).to.deep.equal(document.toObject());
    });
  });
});