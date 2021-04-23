const ValidationResult = require('../../validation/ValidationResult');

const MissingStateTransitionTypeError = require('../../errors/MissingStateTransitionTypeError');
const InvalidStateTransitionTypeError = require('../../errors/InvalidStateTransitionTypeError');
const StateTransitionMaxSizeExceededError = require('../../errors/StateTransitionMaxSizeExceededError');
const MaxEncodedBytesReachedError = require('../../util/errors/MaxEncodedBytesReachedError');

/**
 * @param {Object.<number, Function>} validationFunctionsByType
 * @param {createStateTransition} createStateTransition
 * @return {validateStateTransitionStructure}
 */
function validateStateTransitionStructureFactory(
  validationFunctionsByType,
  createStateTransition,
) {
  /**
   * @typedef validateStateTransitionStructure
   * @param {RawStateTransition} rawStateTransition
   */
  async function validateStateTransitionStructure(rawStateTransition) {
    const result = new ValidationResult();

    if (!Object.prototype.hasOwnProperty.call(rawStateTransition, 'type')) {
      result.addError(
        new MissingStateTransitionTypeError(rawStateTransition),
      );

      return result;
    }

    if (!validationFunctionsByType[rawStateTransition.type]) {
      result.addError(
        new InvalidStateTransitionTypeError(rawStateTransition),
      );

      return result;
    }

    const validationFunction = validationFunctionsByType[rawStateTransition.type];
    console.log('validationFunction');
    result.merge(
      await validationFunction(rawStateTransition),
    );

    if (!result.isValid()) {
      return result;
    }
    console.log('createStateTransition');
    const stateTransition = await createStateTransition(rawStateTransition);
    console.log('after createStateTransition');
    try {
      stateTransition.toBuffer();
    } catch (e) {
      console.error('validateStateTransitionStructure err', e);
      if (e instanceof MaxEncodedBytesReachedError) {
        result.addError(
          new StateTransitionMaxSizeExceededError(rawStateTransition, e.getMaxSizeKBytes()),
        );
      } else {
        throw e;
      }
    }

    return result;
  }

  return validateStateTransitionStructure;
}

module.exports = validateStateTransitionStructureFactory;
