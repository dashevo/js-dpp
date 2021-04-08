const {
  Transaction,
  PrivateKey,
  Script,
  Opcode,
} = require('@dashevo/dashcore-lib');

const AssetLock = require('../../identity/stateTransitions/assetLock/AssetLock');

function getChainAssetLockFixture(oneTimePrivateKey = new PrivateKey()) {
  const privateKeyHex = 'cSBnVM4xvxarwGQuAfQFwqDg9k5tErHUHzgWsEfD4zdwUasvqRVY';
  const privateKey = new PrivateKey(privateKeyHex);
  const fromAddress = privateKey.toAddress();

  const oneTimePublicKey = oneTimePrivateKey.toPublicKey();

  const transaction = new Transaction()
    .from({
      address: fromAddress,
      txId: 'a477af6b2667c29670467e4e0728b685ee07b240235771862318e29ddbe58458',
      outputIndex: 0,
      script: Script.buildPublicKeyHashOut(fromAddress)
        .toString(),
      satoshis: 100000,
    })
    // eslint-disable-next-line no-underscore-dangle
    .addBurnOutput(90000, oneTimePublicKey._getID())
    .to(fromAddress, 5000)
    .addOutput(Transaction.Output({
      satoshis: 5000,
      script: Script()
        .add(Opcode.OP_RETURN)
        .add(Buffer.from([1, 2, 3])),
    }))
    .sign(privateKey);

  const outPoint = {
    outpointHash: '6e200d059fb567ba19e92f5c2dcd3dde522fd4e0a50af223752db16158dabb1d',
    outpointIndex: 0,
  };

  const binaryTransactionHash = Buffer.from(outPoint.outpointHash, 'hex');
  const indexBuffer = Buffer.alloc(4);

  indexBuffer.writeUInt32LE(outPoint.outputIndex, 0);

  return new AssetLock({
    transaction: transaction.toBuffer(),
    outputIndex: 0,
    proof: {
      type: AssetLock.PROOF_TYPE_CHAIN,
      height: 42,
      outPoint: Buffer.concat([binaryTransactionHash, indexBuffer]),
    },
  });
}

module.exports = getChainAssetLockFixture;
