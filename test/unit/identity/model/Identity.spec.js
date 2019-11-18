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
      identityType: 0,
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
    it('should set valiables from raw model', () => {
      const instance = new Identity(rawModel);

      expect(instance.id).to.equal(rawModel.id);
      expect(instance.publicKeys).to.deep.equal(rawModel.publicKeys);
    });
  });

  describe('#applyStateTransition', () => {
    it('should throw an error if state transition is of wrong type', () => {
      try {
        model.applyStateTransition({
          getType: () => 42,
        });

        expect.fail('error was not thrown');
      } catch (e) {
        expect(e.name).to.equal('WrongStateTransitionTypeError');
        expect(e.message).to.equal(
          'Can\'t apply a state transition to the Identity model, wrong state transition type',
        );
      }
    });

    it('should throw na error if data is already set', () => {
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
        getIdentityType: () => 0,
        getIdentityId: () => Buffer.alloc(32).toString('base64'),
      });

      expect(instance.id).to.equal('someId');
      expect(instance.identityType).to.equal(5);
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

  describe('#getIdentityType', () => {
    it('should return set identity type', () => {
      model.identityType = 42;
      expect(model.getIdentityType()).to.equal(42);
    });
  });

  describe('#setIdentityType', () => {
    it('should set identity type', () => {
      model.setIdentityType(42);
      expect(model.identityType).to.equal(42);
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

  describe('#toJSON', () => {
    it('should return json reresentation', () => {
      const json = model.toJSON();

      expect(json).to.deep.equal(rawModel);
    });
  });
});
