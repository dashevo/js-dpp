const Identity = require('../../identity/model/Identity');

/**
 * @return {Identity}
 */
module.exports = function getIdentityFixture() {
  const rawIdentity = {
    id: Buffer.alloc(32).toString('base64'),
    type: 0,
    publicKeys: [
      {
        id: 1,
        type: 0,
        publicKey: 'I5q3O2KMNSWAYd4eF7fY5g2grOju4fSAoqrqTJ9kEtc=',
        isEnabled: true,
      },
    ],
  };

  return new Identity(rawIdentity);
};
