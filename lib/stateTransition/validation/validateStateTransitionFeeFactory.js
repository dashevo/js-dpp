const ValidationResult = require('../../validation/ValidationResult');
const stateTransitionTypes = require('../../stateTransition/stateTransitionTypes');
const InvalidStateTransitionTypeError = require('../../errors/InvalidStateTransitionTypeError');
const IdentityBalanceIsNotEnoughError = require('../../errors/IdentityBalanceIsNotEnoughError');

const PRICE_PER_BYTE = 1;

/**
 * Validate state transition fee
 *
 * @param {DataProvider} dataProvider
 * @return {validateStateTransitionFee}
 */
function validateStateTransitionFeeFactory(dataProvider) {
  /**
   * @typedef validateStateTransitionFee
   * @param {DataContractStateTransition|DocumentsStateTransition} stateTransition
   * @return {ValidationResult}
   */
  async function validateStateTransitionFee(stateTransition) {
    const result = new ValidationResult();

    const serializedStateTransition = stateTransition.serialize({ skipSignature: true });
    const byteSize = Buffer.byteLength(serializedStateTransition);
    const feeSize = byteSize * PRICE_PER_BYTE;

    let identityId;
    switch (stateTransition.getType()) {
      case stateTransitionTypes.DATA_CONTRACT:
        identityId = stateTransition.getDataContract().getOwnerId();
        break;
      case stateTransitionTypes.DOCUMENTS:
        identityId = stateTransition.getDocuments()[0].getOwnerId();
        break;
      default:
        throw new InvalidStateTransitionTypeError(stateTransition.toJSON());
    }

    const identity = await dataProvider.fetchIdentity(identityId);

    if (identity.getBalance() < feeSize) {
      result.addError(
        new IdentityBalanceIsNotEnoughError(identity.getBalance()),
      );
    }

    return result;
  }

  return validateStateTransitionFee;
}

module.exports = validateStateTransitionFeeFactory;
