const ValidationResult = require('../../validation/ValidationResult');
const stateTransitionTypes = require('../../stateTransition/stateTransitionTypes');
const InvalidStateTransitionTypeError = require('../../errors/InvalidStateTransitionTypeError');
const BalanceIsNotEnoughError = require('../../errors/BalanceIsNotEnoughError');
const { convertSatoshiToCredits } = require('../../identity/convertBalance');

const PRICE_PER_BYTE = 1;

/**
 * Validate state transition fee
 *
 * @param {DataProvider} dataProvider
 * @param {validateLockTransaction} validateLockTransaction
 * @return {validateStateTransitionFee}
 */
function validateStateTransitionFeeFactory(
  dataProvider,
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

    switch (stateTransition.getType()) {
      case stateTransitionTypes.IDENTITY_CREATE: {
        const validateLockTransactionResult = await validateLockTransaction(stateTransition);

        if (!validateLockTransactionResult.isValid()) {
          result.merge(validateLockTransactionResult);

          return result;
        }

        const output = validateLockTransactionResult.getData();

        balance = convertSatoshiToCredits(output.satoshis);

        break;
      }
      case stateTransitionTypes.DATA_CONTRACT:
      case stateTransitionTypes.DOCUMENTS: {
        const identityId = stateTransition.getOwnerId();
        const identity = await dataProvider.fetchIdentity(identityId);
        balance = identity.getBalance();

        break;
      }
      default:
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
