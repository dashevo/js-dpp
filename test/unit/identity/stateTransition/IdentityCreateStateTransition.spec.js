const IdentityCreateStateTransition = require(
  '../../../../lib/identity/stateTransitions/IdentityCreateStateTransition',
);

const stateTransitionTypes = require(
  '../../../../lib/stateTransition/stateTransitionTypes',
);

describe('IdentityCreateStateTransition', () => {
  let rawStateTransition;
  let stateTransition;

  beforeEach(() => {
    rawStateTransition = {
      identityCreateStateTransitionVersion: 1,
      lockedOutPoint: Buffer.alloc(1),
      identityType: 1,
      publicKeys: [
        {
          id: 1,
          type: 1,
          publicKey: 'someString',
          isEnabled: true,
        },
      ],
      ownershipProofSignature: Buffer.alloc(1),
    };

    stateTransition = new IdentityCreateStateTransition(rawStateTransition);
  });

  describe('#constructor', () => {
    it('should create an instance with default values if nothing specified', () => {
      stateTransition = new IdentityCreateStateTransition();

      expect(stateTransition.identityCreateStateTransitionVersion).to.equal(0);
      expect(stateTransition.identityType).to.equal(0);
      expect(stateTransition.publicKeys).to.deep.equal([]);
    });

    it('should create an instance with specified data from specified raw transition', () => {
      expect(stateTransition.identityCreateStateTransitionVersion).to.equal(1);
      expect(stateTransition.identityType).to.equal(1);
      expect(stateTransition.lockedOutPoint).to.deep.equal(Buffer.alloc(1));
      expect(stateTransition.publicKeys).to.have.deep.members([
        rawStateTransition.publicKeys[0],
      ]);
      expect(stateTransition.ownershipProofSignature).to.deep.equal(Buffer.alloc(1));
    });
  });

  describe('#getType', () => {
    it('should return IDENTITY_CREATE type', () => {
      expect(stateTransition.getType()).to.equal(stateTransitionTypes.IDENTITY_CREATE);
    });
  });

  describe('#setIdentityStateTransitionVersion', () => {
    it('should set identity state transition version', () => {
      stateTransition.setIdentityStateTransitionVersion(42);
      expect(stateTransition.identityCreateStateTransitionVersion).to.equal(42);
    });
  });

  describe('#getIdentityStateTransitionVersion', () => {
    it('should return currently set identity state transition version', () => {
      expect(stateTransition.getIdentityStateTransitionVersion()).to.equal(1);
    });
  });

  describe('#setLockedOutPoint', () => {
    it('should set locked OutPoint', () => {
      stateTransition.setLockedOutPoint(Buffer.alloc(42, 3));
      expect(stateTransition.lockedOutPoint).to.deep.equal(Buffer.alloc(42, 3));
    });
  });

  describe('#getLockedOutPoint', () => {
    it('should return currently set locked OutPoint', () => {
      expect(stateTransition.getLockedOutPoint()).to.deep.equal(Buffer.alloc(1));
    });
  });

  describe('#setIdentityType', () => {
    it('should set identity type', () => {
      stateTransition.setIdentityType(42);
      expect(stateTransition.identityType).to.equal(42);
    });
  });

  describe('#getIdentityType', () => {
    it('should return set identity type', () => {
      expect(stateTransition.getIdentityType()).to.equal(1);
    });
  });

  describe('#setPublicKeys', () => {
    it('should set public keys', () => {
      stateTransition.setPublicKeys([1, 2]);
      expect(stateTransition.publicKeys).to.have.deep.members([1, 2]);
    });
  });

  describe('#getPublicKeys', () => {
    it('should return set public keys', () => {
      expect(stateTransition.getPublicKeys()).to.deep.equal(rawStateTransition.publicKeys);
    });
  });

  describe('#addPublicKeys', () => {
    it('should add more public keys', () => {
      stateTransition.publicKeys = [];
      stateTransition.addPublicKeys([1, 2]);
      expect(stateTransition.getPublicKeys()).to.have.deep.members([
        1, 2,
      ]);
    });
  });

  describe('#setOwnershipProofSignature', () => {
    it('should set ownership proof signature', () => {
      stateTransition.setOwnershipProofSignature(Buffer.alloc(42, 3));
      expect(stateTransition.ownershipProofSignature).to.deep.equal(Buffer.alloc(42, 3));
    });
  });

  describe('#getOwnershipProofSignature', () => {
    it('should return set ownership proof signature', () => {
      expect(stateTransition.getOwnershipProofSignature()).to.deep.equal(
        Buffer.alloc(1),
      );
    });
  });

  describe('#toJSON', () => {
    it('should return JSON representation of the object', () => {
      const json = stateTransition.toJSON();

      expect(json).to.deep.equal({
        protocolVersion: 0,
        type: 3,
        identityCreateStateTransitionVersion: 1,
        identityType: 1,
        lockedOutPoint: rawStateTransition.lockedOutPoint,
        publicKeys: rawStateTransition.publicKeys,
        ownershipProofSignature: rawStateTransition.ownershipProofSignature,
      });
    });
  });
});
