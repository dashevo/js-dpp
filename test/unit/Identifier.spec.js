const crypto = require('crypto');
const bs58 = require('bs58');
const Identifier = require('../../lib/Identifier');

describe('Identifier', () => {
  let buffer;

  beforeEach(() => {
    buffer = crypto.randomBytes(32);
  });

  describe('#constructor', () => {
    it('should accept Buffer', () => {
      const identifier = new Identifier(buffer);

      expect(identifier).to.be.deep.equal(buffer);
    });

    it('should throw error if first argument is not Buffer', () => {
      expect(
        () => new Identifier(1),
      ).to.throw(TypeError, 'Identifier expects Buffer');
    });

    it('should throw error if buffer is not 32 bytes long', () => {
      expect(
        () => new Identifier(Buffer.alloc(30)),
      ).to.throw(TypeError, 'Identifier must be 32 long');
    });
  });

  describe('#toBuffer', () => {
    it('should return a new normal Buffer', () => {
      const identifier = new Identifier(buffer, Identifier.ENCODING.BASE64);

      const data = identifier.toBuffer();

      expect(data).to.deep.equal(buffer);
    });
  });

  describe('#encodeCBOR', () => {
    let encoderMock;

    beforeEach(function before() {
      encoderMock = {
        push: this.sinonSandbox.stub(),
      };
    });

    it('should encode using cbor encoder', () => {
      const identifier = new Identifier(buffer);

      const result = identifier.encodeCBOR(encoderMock);

      expect(result).to.be.true();
      expect(encoderMock.push).to.be.calledOnceWithExactly(buffer);
    });
  });

  describe('#toJSON', () => {
    it('should return a base58 encoded string', () => {
      const identifier = new Identifier(buffer);

      const string = identifier.toJSON();

      expect(string).to.equal(bs58.encode(buffer));
    });
  });

  describe('#toString', () => {
    it('should return a base58 encoded string by default', () => {
      const identifier = new Identifier(buffer);

      const string = identifier.toString();

      expect(string).to.equal(buffer.toString('base64').replace(/=/g, ''));
    });

    it('should return a string encoded with specified encoding', () => {
      const encodedBuffer = new Identifier(buffer);

      const string = encodedBuffer.toString('base64');

      expect(string).to.equal(buffer.toString('base64'));
    });
  });

  describe('#from', () => {
    it('should create an instance using buffer', async () => {
      const encoding = Identifier.ENCODING.BASE58;

      const encodedBuffer = Identifier.from(buffer, encoding);

      expect(encodedBuffer).to.be.an.instanceOf(Identifier);
      expect(encodedBuffer.toBuffer()).to.deep.equal(buffer);
      expect(encodedBuffer.getEncoding()).to.equal(encoding);
    });

    it('should create an instance using base64 string representation', () => {
      const encoding = Identifier.ENCODING.BASE64;
      const data = buffer.toString('base64').replace(/=/g, '');

      const encodedBuffer = Identifier.from(data, encoding);

      expect(encodedBuffer).to.be.an.instanceOf(Identifier);
      expect(encodedBuffer.toBuffer()).to.deep.equal(buffer);
      expect(encodedBuffer.getEncoding()).to.equal(encoding);
    });

    it('should create an instance using base58 string representation', () => {
      const encoding = Identifier.ENCODING.BASE58;
      const data = bs58.encode(buffer);

      const encodedBuffer = Identifier.from(data, encoding);

      expect(encodedBuffer).to.be.an.instanceOf(Identifier);
      expect(encodedBuffer.toBuffer()).to.deep.equal(buffer);
      expect(encodedBuffer.getEncoding()).to.equal(encoding);
    });
  });



  it('should throw InvalidBufferEncodingError if encoding in unknown', () => {
    const encoding = 'myEncoding';

    try {
      // eslint-disable-next-line no-new
      new Identifier(buffer, encoding);

      expect.fail('Should throw InvalidBufferEncodingError');
    } catch (e) {
      expect(e).to.be.an.instanceOf(InvalidBufferEncodingError);
      expect(e.getEncoding()).to.equal(encoding);
    }
  });
});
