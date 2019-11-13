const { PrivateKey } = require('@dashevo/dashcore-lib');

const StateTransitionMock = require('../../../lib/test/mocks/StateTransitionMock');
const signatureTypes = require('../../../lib/stateTransition/signatureTypes');
const InvalidSignatureTypeError = require('../../../lib/stateTransition/errors/InvalidSignatureTypeError');

describe('AbstractStateTransition', () => {
  let stateTransition;
  let signPayload;
  let privateKey;
  let publicKey;

  beforeEach(() => {
    privateKey = new PrivateKey();
    ({ publicKey } = privateKey);

    stateTransition = new StateTransitionMock();

    signPayload = {
      id: 1,
      type: signatureTypes.ECDSA,
      privateKey,
    };
  });

  it('should serialize data to JSON', () => {
    const serializedData = stateTransition.toJSON();

    expect(serializedData).to.deep.equal({
      publicKeyId: null,
      protocolVersion: 0,
      signature: null,
      type: 1,
    });
  });

  it('should serialize data to JSON without signature data', () => {
    const serializedData = stateTransition.toJSON({ skipSignature: true });

    expect(serializedData).to.deep.equal({
      protocolVersion: 0,
      type: 1,
    });
  });

  it('should sign data and validate signature', () => {
    stateTransition.sign(signPayload);

    // eslint-disable-next-line no-underscore-dangle
    const isValid = stateTransition.verifySignature(publicKey._getID());

    expect(isValid).to.be.true();
  });

  it('should throw InvalidSignatureTypeError if signature type is not equal ECDSA', () => {
    signPayload.type = 2;

    try {
      stateTransition.sign(signPayload);

      expect.fail('Should throw InvalidSignatureTypeError');
    } catch (e) {
      expect(e).to.be.instanceOf(InvalidSignatureTypeError);
      expect(e.getSignatureType()).to.be.equal(signPayload.type);
    }
  });

  it('should not verify signature with wrong public key', () => {
    stateTransition.sign(signPayload);

    publicKey = 'someKey';

    const isValid = stateTransition.verifySignature(publicKey);

    expect(isValid).to.be.false();
  });

  it('should not verify signature before sign was made', () => {
    const isValid = stateTransition.verifySignature(publicKey);

    expect(isValid).to.be.false();
  });

  it('should return serialized hash', () => {
    const hash = stateTransition.hash();

    expect(hash).to.be.equal('dcea91861d071861c45f70a308b89b288e168b32b4a7389e682fc1360b8c1953');
  });

  it('should return serialized data', () => {
    const serializedData = stateTransition.serialize();

    expect(serializedData.toString('hex')).to.be.equal('a4647479706501697369676e6174757265f66b7075626c69634b65794964f66f70726f746f636f6c56657273696f6e00');
  });

  it('should return serialized data without signature data', () => {
    const serializedData = stateTransition.serialize({ skipSignature: true });

    expect(serializedData.toString('hex')).to.be.equal('a26474797065016f70726f746f636f6c56657273696f6e00');
  });

  it('should return key ID', () => {
    stateTransition.sign(signPayload);

    const keyId = stateTransition.getPublicKeyId();

    expect(keyId).to.be.equal(signPayload.id);
  });

  it('should return protocol version', async () => {
    const protocolVersion = stateTransition.getProtocolVersion();

    expect(protocolVersion).to.be.equal(0);
  });
});
