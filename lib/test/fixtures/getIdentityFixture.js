const bs58 = require('bs58');

const Identity = require('../../identity/Identity');
const IdentityPublicKey = require('../../identity/IdentityPublicKey');

/**
 * @return {Identity}
 */
module.exports = function getIdentityFixture() {
  const rawIdentity = {
    id: 'FWHsGxiFNxDAWHQZ76LYskV6jpUW5U7swUookDfrFHrs',
    type: Identity.TYPES.USER,
    publicKeys: [
      {
        id: 1,
        type: IdentityPublicKey.TYPES.ECDSA_SECP256K1,
        data: 'I5q3O2KMNSWAYd4eF7fY5g2grOju4fSAoqrqTJ9kEtc=',
        isEnabled: true,
      },
    ],
  };

  return new Identity(rawIdentity);
};
