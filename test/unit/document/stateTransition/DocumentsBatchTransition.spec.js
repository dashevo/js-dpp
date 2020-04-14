const rewiremock = require('rewiremock/node');

const getDocumentsFixture = require('../../../../lib/test/fixtures/getDocumentsFixture');
const stateTransitionTypes = require('../../../../lib/stateTransition/stateTransitionTypes');

const { getProtocolVersion } = require('../../../../lib/util/version');

describe('DocumentsBatchTransition', () => {
  let stateTransition;
  let documents;
  let hashMock;
  let encodeMock;
  let protocolVersion;

  beforeEach(function beforeEach() {
    documents = getDocumentsFixture();

    hashMock = this.sinonSandbox.stub();
    const serializerMock = { encode: this.sinonSandbox.stub() };
    encodeMock = serializerMock.encode;

    const DocumentFactory = rewiremock.proxy('../../../../lib/document/DocumentFactory', {
      '../../../../lib/util/hash': hashMock,
      '../../../../lib/util/serializer': serializerMock,
    });

    const factory = new DocumentFactory(undefined, undefined);
    stateTransition = factory.createStateTransition({
      create: documents,
    });
    protocolVersion = getProtocolVersion();
  });

  describe('#getType', () => {
    it('should return State Transition type', () => {
      const result = stateTransition.getType();

      expect(result).to.equal(stateTransitionTypes.DOCUMENTS);
    });
  });

  describe('#getTransitions', () => {
    it('should return document transitions', () => {
      const result = stateTransition.getTransitions();

      expect(result).to.equal(stateTransition.transitions);
    });
  });

  describe('#toJSON', () => {
    it('should return State Transition as plain JS object', () => {
      expect(stateTransition.toJSON()).to.deep.equal({
        protocolVersion,
        type: stateTransitionTypes.DOCUMENTS,
        contractId: documents[0].contractId,
        ownerId: documents[0].ownerId,
        transitions: stateTransition.getTransitions().map((d) => d.toJSON()),
        signaturePublicKeyId: null,
        signature: null,
      });
    });
  });

  describe('#serialize', () => {
    it('should return serialized Documents State Transition', () => {
      const serializedStateTransition = '123';

      encodeMock.returns(serializedStateTransition);

      const result = stateTransition.serialize();

      expect(result).to.equal(serializedStateTransition);

      expect(encodeMock).to.have.been.calledOnceWith(stateTransition.toJSON());
    });
  });

  describe('#hash', () => {
    it('should return Documents State Transition hash as hex', () => {
      const serializedDocument = '123';
      const hashedDocument = '456';

      encodeMock.returns(serializedDocument);
      hashMock.returns(hashedDocument);

      const result = stateTransition.hash();

      expect(result).to.equal(hashedDocument);

      expect(encodeMock).to.have.been.calledOnceWith(stateTransition.toJSON());
      expect(hashMock).to.have.been.calledOnceWith(serializedDocument);
    });
  });

  describe('#getOwnerId', () => {
    it('should return owner id', async () => {
      const result = stateTransition.getOwnerId();

      expect(result).to.equal(getDocumentsFixture.ownerId);
    });
  });
});
