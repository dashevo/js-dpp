const Document = require('../../../lib/document/Document');

const getDataContractFixture = require('../../../lib/test/fixtures/getDataContractFixture');
const getDocumentsFixture = require('../../../lib/test/fixtures/getDocumentsFixture');

describe('Document', () => {
  let document;
  let dataContract;

  beforeEach(() => {
    dataContract = getDataContractFixture();
    [document] = getDocumentsFixture(dataContract).slice(-1);
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
        binaryField: document.getData().binaryField.toString('base64').replace(/=/g, ''),
      });
    });
  });

  describe('#toObject', () => {
    it('should return raw document', () => {
      const result = document.toObject();

      expect(result).to.deep.equal({
        $dataContractId: dataContract.getId(),
        $id: document.getId(),
        $ownerId: getDocumentsFixture.ownerId,
        $revision: 1,
        $type: 'withContentEncoding',
        binaryField: document.getData().binaryField,
      });
    });
  });

  describe('#fromJSON', () => {
    it('should return new document from raw document in JSON format', () => {
      const result = Document.fromJSON(document.toJSON(), dataContract);

      expect(result.toObject()).to.deep.equal(document.toObject());
    });
  });
});
