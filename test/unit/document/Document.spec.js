const rewiremock = require('rewiremock/node');

const DataContractFactory = require('../../../lib/dataContract/DataContractFactory');

const generateRandomId = require('../../../lib/test/utils/generateRandomId');

const DocumentCreateTransition = require(
  '../../../lib/document/stateTransition/documentTransition/DocumentCreateTransition',
);

const EncodedBuffer = require('../../../lib/util/encoding/EncodedBuffer');

describe('Document', () => {
  let lodashGetMock;
  let lodashSetMock;
  let lodashCloneDeepMock;
  let hashMock;
  let encodeMock;
  let Document;
  let rawDocument;
  let document;
  let dataContract;

  beforeEach(function beforeEach() {
    lodashGetMock = this.sinonSandbox.stub();
    lodashSetMock = this.sinonSandbox.stub();
    lodashCloneDeepMock = this.sinonSandbox.stub().returnsArg(0);
    hashMock = this.sinonSandbox.stub();
    const serializerMock = { encode: this.sinonSandbox.stub() };
    encodeMock = serializerMock.encode;

    const now = new Date().getTime();

    Document = rewiremock.proxy('../../../lib/document/Document', {
      '../../../node_modules/lodash.get': lodashGetMock,
      '../../../node_modules/lodash.set': lodashSetMock,
      '../../../node_modules/lodash.clonedeep': lodashCloneDeepMock,
      '../../../lib/util/hash': hashMock,
      '../../../lib/util/serializer': serializerMock,
    });

    const ownerId = generateRandomId();

    const dataContractFactory = new DataContractFactory(() => {});

    dataContract = dataContractFactory.create(ownerId, {
      test: {
        properties: {
          name: {
            type: 'string',
          },
          dataObject: {
            type: 'object',
            properties: {
              binaryObject: {
                type: 'object',
                properties: {
                  base64Value: {
                    type: 'string',
                    contentEncoding: 'base64',
                    maxLength: 64,
                    pattern: '^([A-Za-z0-9+/])+$',
                  },
                },
              },
            },
          },
        },
      },
    });

    rawDocument = {
      $protocolVersion: Document.PROTOCOL_VERSION,
      $id: 'D3AT6rBtyTqx3hXFckwtP81ncu49y5ndE7ot9JkuNSeB',
      $type: 'test',
      $dataContractId: dataContract.getId(),
      $ownerId: ownerId,
      $revision: DocumentCreateTransition.INITIAL_REVISION,
      $createdAt: now,
      $updatedAt: now,
    };

    document = new Document(rawDocument, dataContract);
  });

  describe('constructor', () => {
    beforeEach(function beforeEach() {
      Document.prototype.setData = this.sinonSandbox.stub();
    });

    it('should create Document with $id and data if present', () => {
      const data = {
        test: 1,
      };

      rawDocument = {
        $id: 'id',
        $type: 'test',
        ...data,
      };

      document = new Document(rawDocument, dataContract);

      expect(document.id).to.equal(rawDocument.$id);
      expect(Document.prototype.setData).to.have.been.calledOnceWith(data);
    });

    it('should create Document with $type and data if present', () => {
      const data = {
        test: 1,
      };

      rawDocument = {
        $type: 'test',
        ...data,
      };

      document = new Document(rawDocument, dataContract);

      expect(document.type).to.equal(rawDocument.$type);
      expect(Document.prototype.setData).to.have.been.calledOnceWith(data);
    });

    it('should create Document with $dataContractId and data if present', () => {
      const data = {
        test: 1,
      };

      rawDocument = {
        $dataContractId: generateRandomId(),
        $type: 'test',
        ...data,
      };

      document = new Document(rawDocument, dataContract);

      expect(document.dataContractId).to.equal(rawDocument.$dataContractId);
      expect(Document.prototype.setData).to.have.been.calledOnceWith(data);
    });

    it('should create Document with $ownerId and data if present', () => {
      const data = {
        test: 1,
      };

      rawDocument = {
        $ownerId: generateRandomId(),
        $type: 'test',
        ...data,
      };

      document = new Document(rawDocument, dataContract);

      expect(document.ownerId).to.equal(rawDocument.$ownerId);
      expect(Document.prototype.setData).to.have.been.calledOnceWith(data);
    });

    it('should create Document with undefined action and data if present', () => {
      const data = {
        test: 1,
      };

      rawDocument = {
        $type: 'test',
        ...data,
      };

      document = new Document(rawDocument, dataContract);

      expect(document.action).to.equal(undefined);
      expect(Document.prototype.setData).to.have.been.calledOnceWith(data);
    });

    it('should create Document with $revision and data if present', () => {
      const data = {
        test: 1,
      };

      rawDocument = {
        $revision: 'test',
        $type: 'test',
        ...data,
      };

      document = new Document(rawDocument, dataContract);

      expect(document.revision).to.equal(rawDocument.$revision);
      expect(Document.prototype.setData).to.have.been.calledOnceWith(data);
    });

    it('should create Document with $createdAt and data if present', async () => {
      const data = {
        test: 1,
      };

      const createdAt = new Date().getTime();

      rawDocument = {
        $createdAt: createdAt,
        $type: 'test',
        ...data,
      };

      document = new Document(rawDocument, dataContract);

      expect(document.getCreatedAt().getTime()).to.equal(rawDocument.$createdAt);
      expect(Document.prototype.setData).to.have.been.calledOnceWith(data);
    });

    it('should create Document with $updatedAt and data if present', async () => {
      const data = {
        test: 1,
      };

      const updatedAt = new Date().getTime();

      rawDocument = {
        $updatedAt: updatedAt,
        $type: 'test',
        ...data,
      };

      document = new Document(rawDocument, dataContract);

      expect(document.getUpdatedAt().getTime()).to.equal(rawDocument.$updatedAt);
      expect(Document.prototype.setData).to.have.been.calledOnceWith(data);
    });
  });

  describe('#getId', () => {
    it('should return ID', () => {
      const id = '123';

      document.id = id;

      const actualId = document.getId();

      expect(hashMock).to.have.not.been.called();

      expect(id).to.equal(actualId);
    });
  });

  describe('#getType', () => {
    it('should return $type', () => {
      expect(document.getType()).to.equal(rawDocument.$type);
    });
  });

  describe('#getOwnerId', () => {
    it('should return $ownerId', () => {
      expect(document.getOwnerId()).to.equal(rawDocument.$ownerId);
    });
  });

  describe('#getDataContractId', () => {
    it('should return $dataContractId', () => {
      expect(document.getOwnerId()).to.equal(rawDocument.$ownerId);
    });
  });

  describe('#setRevision', () => {
    it('should set $revision', () => {
      const revision = 5;

      const result = document.setRevision(revision);

      expect(result).to.equal(document);

      expect(document.revision).to.equal(revision);
    });
  });

  describe('#getRevision', () => {
    it('should return $revision', () => {
      const revision = 5;

      document.revision = revision;

      expect(document.getRevision()).to.equal(revision);
    });
  });

  describe('#setData', () => {
    beforeEach(function beforeEach() {
      Document.prototype.set = this.sinonSandbox.stub();
    });

    it('should call set for each document property', () => {
      const data = {
        test1: 1,
        test2: 2,
      };

      const result = document.setData(data);

      expect(result).to.equal(document);

      expect(Document.prototype.set).to.have.been.calledTwice();

      expect(Document.prototype.set).to.have.been.calledWith('test1', 1);
      expect(Document.prototype.set).to.have.been.calledWith('test2', 2);
    });
  });

  describe('#getData', () => {
    it('should return all data', () => {
      const data = {
        test1: 1,
        test2: 2,
      };

      document.data = data;

      expect(document.getData()).to.equal(data);
    });
  });

  describe('#set', () => {
    it('should set value for specified property name', () => {
      const path = 'test[0].$my';
      const value = 2;

      const result = document.set(path, value);

      expect(result).to.equal(document);

      expect(lodashSetMock).to.have.been.calledOnceWith(document.data, path, value);
    });

    it('should set binary encoded field directly', () => {
      const path = 'dataObject.binaryObject.base64Value';
      const buffer = Buffer.alloc(36);

      const result = document.set(path, buffer);

      expect(result).to.equal(document);

      const valueToSet = new EncodedBuffer(buffer, 'base64');

      expect(lodashSetMock).to.have.been.calledOnceWith(document.data, path, valueToSet);
    });

    it('should set binary field as part of object', () => {
      const path = 'dataObject.binaryObject';
      const value = { base64Value: Buffer.alloc(36) };

      lodashGetMock.returns(value.base64Value);

      const result = document.set(path, value);

      expect(result).to.equal(document);

      const valueToSet = new EncodedBuffer(value.base64Value, 'base64');

      expect(lodashSetMock).to.have.been.calledTwice();
      expect(lodashSetMock.getCall(0).args).to.have.deep.members(
        [value, 'base64Value', valueToSet],
      );
      expect(lodashSetMock.getCall(1).args).to.have.deep.members(
        [document.data, path, { base64Value: valueToSet }],
      );
    });
  });

  describe('#get', () => {
    it('should return value for specified property name', () => {
      const path = 'test[0].$my';
      const value = 2;

      lodashGetMock.returns(value);

      const result = document.get(path);

      expect(result).to.equal(value);

      expect(lodashGetMock).to.have.been.calledOnceWith(document.data, path);
    });
  });

  describe('#toJSON', () => {
    it('should return Document as plain JS object', () => {
      expect(document.toJSON()).to.deep.equal(rawDocument);
    });
  });

  describe('#serialize', () => {
    it('should return serialized Document', () => {
      const serializedDocument = '123';

      encodeMock.returns(serializedDocument);

      const result = document.serialize();

      expect(result).to.equal(serializedDocument);

      expect(encodeMock).to.have.been.calledOnceWith(rawDocument);
    });
  });

  describe('#hash', () => {
    beforeEach(function beforeEach() {
      Document.prototype.serialize = this.sinonSandbox.stub();
    });

    it('should return Document hash', () => {
      const serializedDocument = '123';
      const hashedDocument = '456';

      Document.prototype.serialize.returns(serializedDocument);

      hashMock.returns(hashedDocument);

      const result = document.hash();

      expect(result).to.equal(hashedDocument);

      expect(Document.prototype.serialize).to.have.been.calledOnce();

      expect(hashMock).to.have.been.calledOnceWith(serializedDocument);
    });
  });

  describe('#setCreatedAt', () => {
    it('should set $createdAt', () => {
      const time = new Date();

      const result = document.setCreatedAt(time);

      expect(result).to.equal(document);

      expect(document.createdAt).to.equal(time);
    });
  });

  describe('#getCreatedAt', () => {
    it('should return $createdAt', () => {
      const time = new Date();

      document.createdAt = time;

      expect(document.getCreatedAt()).to.equal(time);
    });
  });

  describe('#setUpdatedAt', () => {
    it('should set $updatedAt', () => {
      const time = new Date();

      const result = document.setUpdatedAt(time);

      expect(result).to.equal(document);

      expect(document.updatedAt).to.equal(time);
    });
  });

  describe('#getUpdatedAt', () => {
    it('should return $updatedAt', () => {
      const time = new Date();

      document.updatedAt = time;

      expect(document.getUpdatedAt()).to.equal(time);
    });
  });
});
