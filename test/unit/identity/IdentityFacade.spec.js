const rewiremock = require('rewiremock/node');

describe('IdentityFacade', () => {
  let validateMock;
  let validateFactoryMock;
  let validatorStub;
  let factoryMock;
  let factoryClassMock;
  let facade;
  let IdentityFacade;

  beforeEach(function beforeEach() {
    validatorStub = {};
    validateMock = this.sinonSandbox.stub();
    factoryMock = {
      createFromObject: this.sinonSandbox.stub(),
      createFromSerialized: this.sinonSandbox.stub(),
    };

    factoryClassMock = this.sinonSandbox.stub();
    factoryClassMock.returns(factoryMock);

    validateFactoryMock = this.sinonSandbox.stub();
    validateFactoryMock.returns(validateMock);

    IdentityFacade = rewiremock.proxy(
      '../../../lib/identity/IdentityFacade',
      {
        '../../../lib/identity/IdentityFactory': factoryClassMock,
        '../../../lib/identity/validation/validateIdentityFactory': validateFactoryMock,
      },
    );

    facade = new IdentityFacade(validatorStub);
  });

  describe('#constructor', () => {
    it('should set validator and factory', () => {
      expect(validateFactoryMock).to.have.been.calledOnceWithExactly(validatorStub);
      expect(factoryClassMock).to.have.been.calledOnceWithExactly(validateMock);
      expect(facade.validateIdentity).to.deep.equal(validateMock);
      expect(facade.factory).to.deep.equal(factoryMock);
    });
  });

  describe('#create', () => {
    it('should call factory `createFromObject` with default empty object', () => {
      factoryMock.createFromObject.returns(42);

      const result = facade.create();

      expect(factoryMock.createFromObject).to.have.been.calledOnceWithExactly({});
      expect(result).to.equal(42);
    });

    it('should call factory `createFromObject`', () => {
      const data = {
        item: 'blabla',
      };

      factoryMock.createFromObject.returns(42);

      const result = facade.create(data);

      expect(factoryMock.createFromObject).to.have.been.calledOnceWithExactly(data);
      expect(result).to.equal(42);
    });
  });

  describe('#createFromObject', () => {
    it('should call factory `createFromObject`', () => {
      const data = {
        item: 'blabla',
      };

      factoryMock.createFromObject.returns(42);

      const result = facade.createFromObject(data);

      expect(factoryMock.createFromObject).to.have.been.calledOnceWithExactly(data);
      expect(result).to.equal(42);
    });
  });

  describe('#createFromSerialized', () => {
    it('should call factory `createFromSerialized`', () => {
      const data = {
        item: 'blabla',
      };

      factoryMock.createFromSerialized.returns(42);

      const result = facade.createFromSerialized(data);

      expect(factoryMock.createFromSerialized).to.have.been.calledOnceWithExactly(data);
      expect(result).to.equal(42);
    });
  });

  describe('#validate', () => {
    it('should call validate function', () => {
      validateMock.returns(42);

      const identity = 'identity';

      const result = facade.validate(identity);

      expect(validateMock).to.have.been.calledOnceWithExactly(identity);
      expect(result).to.equal(42);
    });
  });
});
