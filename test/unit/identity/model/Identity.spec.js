const rewiremock = require('rewiremock/node');

describe('Identity', () => {
  let rawModel;
  let model;
  let Identity;
  let hashMock;
  let encodeMock;

  beforeEach(function beforeEach() {
    rawModel = {
      id: 'someId',
      type: 0,
      publicKeys: [
        {
          id: 1,
          type: 1,
          publicKey: 'somePublicKey',
          isEnabled: true,
        },
      ],
    };

    hashMock = this.sinonSandbox.stub();
    encodeMock = this.sinonSandbox.stub();

    Identity = rewiremock.proxy(
      '../../../../lib/identity/model/Identity',
      {
        '../../../../lib/util/hash': hashMock,
        '../../../../lib/util/serializer': {
          encode: encodeMock,
        },
      },
    );

    model = new Identity(rawModel);
  });

  describe('#constructor', () => {
    it('should not set anything if nothing passed', () => {
      const instance = new Identity();

      expect(instance.id).to.be.undefined();
      expect(instance.type).to.be.undefined();
      expect(instance.publicKeys).to.be.undefined();
    });

    it('should set variables from raw model', () => {
      const instance = new Identity(rawModel);

      expect(instance.id).to.equal(rawModel.id);
      expect(instance.type).to.equal(rawModel.type);
      expect(instance.publicKeys).to.deep.equal(rawModel.publicKeys);
    });
  });

  describe('#applyStateTransition', () => {
    it('should throw an error if state transition is of wrong type', () => {
      const stateTransition = {
        getType: () => 42,
      };

      try {
        model.applyStateTransition(stateTransition);

        expect.fail('error was not thrown');
      } catch (e) {
        expect(e.name).to.equal('WrongStateTransitionTypeError');
        expect(e.message).to.equal(
          'Can\'t apply a state transition to the Identity model, wrong state transition type',
        );
        expect(e.getStateTransition()).to.deep.equal(stateTransition);
      }
    });

    it('should throw an error if id is already set', () => {
      try {
        model.applyStateTransition({
          getType: () => 3,
        });

        expect.fail('error was not thrown');
      } catch (e) {
        expect(e.message).to.equal(
          'Can\'t apply identity create state transition to already existing model',
        );
      }
    });

    it('should throw an error if publicKeys is already set', () => {
      model.id = undefined;

      try {
        model.applyStateTransition({
          getType: () => 3,
        });

        expect.fail('error was not thrown');
      } catch (e) {
        expect(e.message).to.equal(
          'Can\'t apply identity create state transition to already existing model',
        );
      }
    });

    it('should set proper data from state transition', () => {
      const instance = new Identity({});

      instance.applyStateTransition({
        getType: () => 3,
        getIdentityId: () => 'someId',
        getIdentityType: () => 5,
        getPublicKeys: () => rawModel.publicKeys,
      });

      expect(instance.id).to.equal('someId');
      expect(instance.type).to.equal(5);
      expect(instance.publicKeys).to.deep.equal(rawModel.publicKeys);
    });
  });

  describe('#getId', () => {
    it('should return set id', () => {
      expect(model.getId()).to.equal(rawModel.id);
    });
  });

  describe('#setId', () => {
    it('should set id', () => {
      model.setId(42);
      expect(model.id).to.equal(42);
    });
  });

  describe('#getType', () => {
    it('should return set identity type', () => {
      model.type = 42;
      expect(model.getType()).to.equal(42);
    });
  });

  describe('#setType', () => {
    it('should set identity type', () => {
      model.setType(42);
      expect(model.type).to.equal(42);
    });
  });

  describe('#getPublicKeys', () => {
    it('should return set public keys', () => {
      expect(model.getPublicKeys()).to.deep.equal(rawModel.publicKeys);
    });
  });

  describe('#setPublicKeys', () => {
    it('should set public keys', () => {
      model.setPublicKeys(42);
      expect(model.publicKeys).to.equal(42);
    });
  });

  describe('#getPublicKeyById', () => {
    it('should return a public key for a given id', () => {
      const key = model.getPublicKeyById(1);
      expect(key).to.be.deep.equal(rawModel.publicKeys[0]);
    });

    it("should retunrn undefined if there's no key with such id", () => {
      const key = model.getPublicKeyById(3);
      expect(key).to.be.undefined();
    });
  });

  describe('#serialize', () => {
    it('should return encoded json object', () => {
      encodeMock.returns(42); // for example
      const result = model.serialize();

      expect(encodeMock).to.have.been.calledOnceWith(model.toJSON());
      expect(result).to.equal(42);
    });
  });

  describe('#hash', () => {
    it('should return hex string of a buffer return by serialize', () => {
      const buffer = Buffer.from('someString');
      const bufferHex = buffer.toString('hex');

      encodeMock.returns(buffer);
      hashMock.returns(buffer);

      const result = model.hash();

      expect(encodeMock).to.have.been.calledOnceWith(model.toJSON());
      expect(hashMock).to.have.been.calledOnceWith(buffer);
      expect(result).to.equal(bufferHex);
    });
  });

  describe('#toJSON', () => {
    it('should return json reresentation', () => {
      const json = model.toJSON();

      expect(json).to.deep.equal(rawModel);
    });
  });
});
