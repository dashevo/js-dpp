const { PrivateKey, Transaction } = require('@dashevo/dashcore-lib');

/**
 * Create state transition Transaction
 *
 * @param {string} regTxId Registration transaction ID (User ID)
 * @param {string} privateKeyString
 * @param {STPacket} stPacket
 * @param {string} hashPrevSubTx
 * @returns {Transaction}
 */
function createStateTransition(regTxId, privateKeyString, stPacket, hashPrevSubTx = undefined) {
  const privateKey = new PrivateKey(privateKeyString);

  const payload = new Transaction.Payload.SubTxTransitionPayload();

  payload.setRegTxId(regTxId)
    .setHashPrevSubTx(hashPrevSubTx || regTxId)
    .setHashSTPacket(stPacket.hash())
    .setCreditFee(1001)
    .sign(privateKey);

  return new Transaction({
    type: Transaction.TYPES.TRANSACTION_SUBTX_TRANSITION,
    version: 3,
    fee: 0.01,
    extraPayload: payload.toString(),
  });
}

module.exports = createStateTransition;
