const AssetLock = require('../../identity/stateTransitions/assetLock/AssetLock');

function getChainAssetLockFixture() {
  const outPoint = {
    outpointHash: '6e200d059fb567ba19e92f5c2dcd3dde522fd4e0a50af223752db16158dabb1d',
    outpointIndex: 0,
  };

  const binaryTransactionHash = Buffer.from(outPoint.outpointHash, 'hex');
  const indexBuffer = Buffer.alloc(4);

  indexBuffer.writeUInt32LE(outPoint.outpointIndex, 0);

  return new AssetLock({
    proof: {
      type: AssetLock.PROOF_TYPE_CHAIN,
      height: 42,
      outPoint: Buffer.concat([binaryTransactionHash, indexBuffer]),
    },
  });
}

module.exports = getChainAssetLockFixture;
