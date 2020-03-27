const ValidationResult = require('../../validation/ValidationResult');

const InvalidStateTransitionTypeError = require('../../errors/InvalidStateTransitionTypeError');
const BalanceIsNotEnoughError = require('../../errors/BalanceIsNotEnoughError');
const ConsensusError = require('../../../lib/errors/ConsensusError');

const stateTransitionTypes = require('../../stateTransition/stateTransitionTypes');
const { convertSatoshiToCredits } = require('../../identity/creditsConverter');
const calculateStateTransitionFee = require('../calculateStateTransitionFee');

/**
 * Validate state transition fee
 *
 * @param {DataProvider} dataProvider
 * @param {getLockedTransactionOutput} getLockedTransactionOutput
 * @return {validateStateTransitionFee}
 */
function validateStateTransitionFeeFactory(
  dataProvider,
  getLockedTransactionOutput,
) {
  /**
   * @typedef validateStateTransitionFee
   * @param {
   * DataContractStateTransition|
   * DocumentsBatchTransition|
   * IdentityCreateTransition} stateTransition
   * @return {ValidationResult}
   */
  async function validateStateTransitionFee(stateTransition) {
    const result = new ValidationResult();

    const feeSize = calculateStateTransitionFee(stateTransition);

    let balance;

    switch (stateTransition.getType()) {
      case stateTransitionTypes.IDENTITY_CREATE: {
        let output;
        try {
          output = await getLockedTransactionOutput(stateTransition.getLockedOutPoint());
        } catch (e) {
          if (e instanceof ConsensusError) {
            result.addError(e);
          } else {
            throw e;
          }
        }

        if (!result.isValid()) {
          return result;
        }

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
