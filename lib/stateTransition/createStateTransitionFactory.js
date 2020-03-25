const types = require('./stateTransitionTypes');

const DataContract = require('../dataContract/DataContract');
const Document = require('../document/Document');

const DocumentsBatchTransition = require('../document/stateTransition/DocumentsBatchTransition');
const DataContractCreateTransition = require('../dataContract/stateTransition/DataContractCreateTransition');
const IdentityCreateTransition = require('../identity/stateTransitions/identityCreateTransition/IdentityCreateTransition');

const InvalidStateTransitionTypeError = require('../errors/InvalidStateTransitionTypeError');

/**
 * @return {createStateTransition}
 */
function createStateTransitionFactory() {
  /**
   * @typedef createStateTransition
   * @param {
   * RawDataContractCreateTransition|
   * RawDocumentsBatchTransition|
   * RawIdentityCreateTransition
   * } rawStateTransition
   * @return {DataContractCreateTransition|DocumentsBatchTransition|IdentityCreateTransition}
   */
  function createStateTransition(rawStateTransition) {
    let stateTransition;

    switch (rawStateTransition.type) {
      case types.DATA_CONTRACT:
        stateTransition = new DataContractCreateTransition(rawStateTransition);
        break;
      case types.DOCUMENTS: {
        stateTransition = new DocumentsBatchTransition(rawStateTransition);
        break;
      }
      case types.IDENTITY_CREATE:
        stateTransition = new IdentityCreateTransition(rawStateTransition);
        break;
      default:
        throw new InvalidStateTransitionTypeError(rawStateTransition);
    }

    return stateTransition;
  }

  return createStateTransition;
}

module.exports = createStateTransitionFactory;
