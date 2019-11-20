const rewiremock = require('rewiremock/node');

const InvalidIdentityError = require(
  '../../../lib/identity/errors/InvalidIdentityError',
);

describe('IdentityFactory', () => {
  let factory;
  let validateMock;
  let decodeMock;
  let IdentityFactory;

  beforeEach(function beforeEach() {
    validateMock = this.sinonSandbox.stub();
    decodeMock = this.sinonSandbox.stub();

    IdentityFactory = rewiremock.proxy(
      '../../../lib/identity/IdentityFactory',
      {
        '../../../lib/util/serializer': {
          decode: decodeMock,
        },
      },
    );

    factory = new IdentityFactory(validateMock);
  });

  describe('#constructor', () => {
    it('should set validator', () => {
      expect(factory.validateIdentity).to.equal(validateMock);
    });
  });

  describe('#create', () => {
    it('should call factory `createFromObject` with default empty object', function it() {
      factory.createFromObject = this.sinonSandbox.stub();
      factory.createFromObject.returns(42);

      const result = factory.create();

      expect(factory.createFromObject).to.have.been.calledOnceWithExactly({});
      expect(result).to.equal(42);
    });

    it('should call `createFromObject`', function it() {
      factory.createFromObject = this.sinonSandbox.stub();
      factory.createFromObject.returns(42);

      const data = {
        item: 42,
      };

      const result = factory.create(data);

      expect(factory.createFromObject).to.have.been.calledOnceWithExactly(data);
      expect(result).to.equal(42);
    });
  });

  describe('#createFromObject', () => {
    it('should skip validation if options is set', () => {
      factory.createFromObject({}, { skipValidation: true });

      expect(validateMock).to.have.not.been.called();
    });

    it('should throw an error if validation have failed', () => {
      const errors = [1, 2];
      const rawIdentity = {
        data: 'balbla',
      };

      validateMock.returns({
        isValid: () => false,
        getErrors: () => errors,
      });

      try {
        factory.createFromObject(rawIdentity);

        expect.fail('error was not thrown');
      } catch (e) {
        expect(e).to.be.an.instanceOf(InvalidIdentityError);
        expect(e.getErrors()).to.have.deep.members(errors);
        expect(e.getRawIdentity()).to.deep.equal(rawIdentity);
      }
    });

    it('should create an identity if validation passed', () => {
      const rawIdentity = {
        id: 'blabla',
      };

      validateMock.returns({
        isValid: () => true,
      });

      const result = factory.createFromObject(rawIdentity);

      expect(result.id).to.equal('blabla');
    });
  });

  describe('#createFromSerialized', () => {
    it('should decode data and pass it to `createFromObject`', function it() {
      factory.createFromObject = this.sinonSandbox.stub();
      factory.createFromObject.returns(43);
      decodeMock.returns(42);

      const serialized = 'serialized';

      const result = factory.createFromSerialized(serialized);

      expect(decodeMock).to.have.been.calledOnceWithExactly(serialized);
      expect(factory.createFromObject).to.have.been.calledOnceWithExactly(42);
      expect(result).to.equal(43);
    });
  });
});
