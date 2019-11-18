const Identity = require('../../../../lib/identity/model/Identity');

describe('Identity', () => {
  let rawModel;
  let model;

  beforeEach(() => {
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

    model = new Identity(rawModel);
  });

  describe('#constructor', () => {
    it('should create not set anything if raw model is not passed', () => {
      const instance = new Identity();

      expect(instance.id).to.be.undefined();
      expect(instance.publicKeys).to.be.undefined();
    });

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
      const instance = new Identity();

      instance.applyStateTransition({
        getType: () => 3,
        getLockedOutPoint: () => Buffer.alloc(1).toString('base64'),
        getPublicKeys: () => rawModel.publicKeys,
        getIdentityType: () => 0,
        getIdentityId: () => Buffer.alloc(32).toString('base64'),
      });

      expect(instance.id).to.deep.equal(Buffer.from(
        [
          143, 67, 150, 37, 23, 142, 29, 113,
          182, 46, 166, 186, 6, 27, 179, 187,
          28, 223, 162, 57, 90, 193, 167, 125,
          18, 39, 212, 111, 95, 239, 5, 126,
        ],
      ));
      expect(instance.publicKeys).to.deep.equal(rawModel.publicKeys);
    });
  });

  describe('#getId', () => {
    it('should return set id', () => {
      expect(model.getId()).to.equal(rawModel.id);
    });
  });

  describe('#getPublicKeys', () => {
    it('should return set public keys', () => {
      expect(model.getPublicKeys()).to.deep.equal(rawModel.publicKeys);
    });
  });

  describe('#toJSON', () => {
    it('should return json reresentation', () => {
      const json = model.toJSON();

      expect(json).to.deep.equal(rawModel);
    });
  });
});
