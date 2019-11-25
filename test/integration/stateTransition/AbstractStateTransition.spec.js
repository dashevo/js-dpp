const { PrivateKey } = require('@dashevo/dashcore-lib');

const StateTransitionMock = require('../../../lib/test/mocks/StateTransitionMock');
const IdentityPublicKey = require('../../../lib/identity/IdentityPublicKey');
const InvalidSignatureTypeError = require('../../../lib/stateTransition/errors/InvalidSignatureTypeError');
const InvalidSignaturePublicKeyError = require('../../../lib/stateTransition/errors/InvalidSignaturePublicKeyError');

describe('AbstractStateTransition', () => {
  let stateTransition;
  let privateKey;
  let publicKeyId;
  let identityPublicKey;

  beforeEach(() => {
    const privateKeyModel = new PrivateKey();
    privateKey = privateKeyModel.toBuffer().toString('hex');
    const publicKey = privateKeyModel.toPublicKey().toBuffer().toString('base64');

    stateTransition = new StateTransitionMock();

    identityPublicKey = new IdentityPublicKey()
      .setId(publicKeyId)
      .setType(IdentityPublicKey.TYPES.ECDSA_SECP256K1)
      .setData(publicKey);
  });

  it('should serialize data to JSON', () => {
    const serializedData = stateTransition.toJSON();

    expect(serializedData).to.deep.equal({
      signaturePublicKeyId: null,
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
    stateTransition.sign(identityPublicKey, privateKey);

    const isValid = stateTransition.verifySignature(identityPublicKey);

    expect(isValid).to.be.true();
  });

  it('should throw InvalidSignatureTypeError if signature type is not equal ECDSA', () => {
    identityPublicKey.setType(30000);

    try {
      stateTransition.sign(identityPublicKey, privateKey);

      expect.fail('Should throw InvalidSignatureTypeError');
    } catch (e) {
      expect(e).to.be.instanceOf(InvalidSignatureTypeError);
      expect(e.getSignatureType()).to.be.equal(identityPublicKey.getType());
    }
  });

  it('should not verify signature with incorrect public key', () => {
    stateTransition.sign(identityPublicKey, privateKey);

    identityPublicKey.setData('someKey');

    const isValid = stateTransition.verifySignature(identityPublicKey);

    expect(isValid).to.be.false();
  });

  it('should not verify signature with wrong public key', () => {
    stateTransition.sign(identityPublicKey, privateKey);
    const publicKey = new PrivateKey()
      .toPublicKey()
      .toBuffer()
      .toString('base64');

    identityPublicKey.setData(publicKey);

    const isValid = stateTransition.verifySignature(identityPublicKey);

    expect(isValid).to.be.false();
  });

  it('should not verify signature before sign was made', () => {
    const isValid = stateTransition.verifySignature(publicKeyId);

    expect(isValid).to.be.false();
  });

  it('should return serialized hash', () => {
    const hash = stateTransition.hash();

    expect(hash).to.be.equal('60fbcdd25bfd3581f476aa45341750fbd882a247e42cac2b9dcef89d862a97c4');
  });

  it('should return serialized data', () => {
    const serializedData = stateTransition.serialize();

    expect(serializedData.toString('hex')).to.be.equal('a4647479706501697369676e6174757265f66f70726f746f636f6c56657273696f6e00747369676e61747572655075626c69634b65794964f6');
  });

  it('should return serialized data without signature data', () => {
    const serializedData = stateTransition.serialize({ skipSignature: true });

    expect(serializedData.toString('hex')).to.be.equal('a26474797065016f70726f746f636f6c56657273696f6e00');
  });

  it('should return key ID', () => {
    stateTransition.sign(identityPublicKey, privateKey);

    const keyId = stateTransition.getSignaturePublicKeyId();

    expect(keyId).to.be.equal(publicKeyId);
  });

  it('should return protocol version', async () => {
    const protocolVersion = stateTransition.getProtocolVersion();

    expect(protocolVersion).to.be.equal(0);
  });

  it('should throw an error if we try to sign with wrong public key', () => {
    const publicKey = new PrivateKey()
      .toPublicKey()
      .toBuffer()
      .toString('base64');

    identityPublicKey.setData(publicKey);

    try {
      stateTransition.sign(identityPublicKey, privateKey);

      expect.fail('Should throw InvalidSignaturePublicKeyError');
    } catch (e) {
      expect(e).to.be.instanceOf(InvalidSignaturePublicKeyError);
      expect(e.getSignaturePublicKey()).to.be.equal(identityPublicKey.getData());
    }
  });

  it('should sign with only private key and validate with only public key', () => {
    privateKey = '9b67f852093bc61cea0eeca38599dbfba0de28574d2ed9b99d10d33dc1bde7b2';

    stateTransition.signByPrivateKey(privateKey);

    const signature = stateTransition.getSignature();

    expect(signature).to.be.a('string');
  });

  it('should validate sign by only public key', () => {
    privateKey = '9b67f852093bc61cea0eeca38599dbfba0de28574d2ed9b99d10d33dc1bde7b2';
    const publicKey = 'A1eUrJ7lM6F1m6dbIyk+vXimKfzki+QRMHMwoAmggt6L';

    stateTransition.signByPrivateKey(privateKey);

    const isValid = stateTransition.verifySignatureByPublicKey(publicKey);

    expect(isValid).to.be.true();
  });

  it('should return false if validate sign by only wrong public key', async () => {
    privateKey = '9b67f852093bc61cea0eeca38599dbfba0de28574d2ed9b99d10d33dc1bde7b2';
    const publicKey = 'wrongKey';

    stateTransition.signByPrivateKey(privateKey);

    const isValid = stateTransition.verifySignatureByPublicKey(publicKey);

    expect(isValid).to.be.false();
  });

  it('should set signature', () => {
    const signature = 'signature';
    stateTransition.setSignature(signature);

    expect(stateTransition.signature).to.equal(signature);
  });

  it('should set signature public key id', async () => {
    const signaturePublicKeyId = 1;
    stateTransition.setSignaturePublicKeyId(signaturePublicKeyId);

    expect(stateTransition.signaturePublicKeyId).to.equal(signaturePublicKeyId);
  });
});
