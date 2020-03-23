const ValidationResult = require('../../validation/ValidationResult');
const stateTransitionTypes = require('../../stateTransition/stateTransitionTypes');
const InvalidStateTransitionTypeError = require('../../errors/InvalidStateTransitionTypeError');
const BalanceIsNotEnoughError = require('../../errors/BalanceIsNotEnoughError');

const PRICE_PER_BYTE = 1;

/**
 * Validate state transition fee
 *
 * @param {DataProvider} dataProvider
 * @param {function} parseTransactionOutPointBuffer
 * @param {validateLockTransaction} validateLockTransaction
 * @return {validateStateTransitionFee}
 */
function validateStateTransitionFeeFactory(
  dataProvider,
  parseTransactionOutPointBuffer,
  validateLockTransaction,
) {
  /**
   * @typedef validateStateTransitionFee
   * @param {
   * DataContractStateTransition|
   * DocumentsStateTransition|
   * IdentityCreateTransition} stateTransition
   * @return {ValidationResult}
   */
  async function validateStateTransitionFee(stateTransition) {
    const result = new ValidationResult();

    const serializedStateTransition = stateTransition.serialize({ skipSignature: true });
    const byteSize = Buffer.byteLength(serializedStateTransition);
    const feeSize = byteSize * PRICE_PER_BYTE;

    let balance;

    if (stateTransition.getType() === stateTransitionTypes.IDENTITY_CREATE) {
      result.merge(await validateLockTransaction(stateTransition));

      if (!result.isValid()) {
        return result;
      }

      const transaction = result.getData();

      const lockedOutBuffer = Buffer.from(stateTransition.getLockedOutPoint(), 'base64');
      const { outputIndex } = parseTransactionOutPointBuffer(lockedOutBuffer);
      const output = transaction.outputs[outputIndex];
      balance = output.satoshis;
    } else if (
      stateTransition.getType() === stateTransitionTypes.DATA_CONTRACT
      || stateTransition.getType() === stateTransitionTypes.DOCUMENTS
    ) {
      const identityId = stateTransition.getOwnerId();
      const identity = await dataProvider.fetchIdentity(identityId);
      balance = identity.getBalance();
    } else {
      throw new InvalidStateTransitionTypeError(stateTransition.toJSON());
    }

    if (balance < feeSize) {
      result.addError(
        new BalanceIsNotEnoughError(balance),
      );
    }

    return result;
  }

  return validateStateTransitionFee;
}

module.exports = validateStateTransitionFeeFactory;
