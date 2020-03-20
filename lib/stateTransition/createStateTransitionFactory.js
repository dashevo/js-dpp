const types = require('./stateTransitionTypes');

const DataContract = require('../dataContract/DataContract');

const DocumentsStateTransition = require('../document/stateTransition/DocumentsStateTransition');
const DataContractStateTransition = require('../dataContract/stateTransition/DataContractStateTransition');
const IdentityCreateTransition = require('../identity/stateTransitions/identityCreateTransition/IdentityCreateTransition');

const InvalidStateTransitionTypeError = require('../errors/InvalidStateTransitionTypeError');

/**
 * @return {createStateTransition}
 */
function createStateTransitionFactory() {
  /**
   * @typedef createStateTransition
   * @param {
   * RawDataContractStateTransition|
   * RawDocumentsStateTransition|
   * RawIdentityCreateTransition
   * } rawStateTransition
   * @return {DataContractStateTransition|DocumentsStateTransition|IdentityCreateTransition}
   */
  function createStateTransition(rawStateTransition) {
    let stateTransition;

    switch (rawStateTransition.type) {
      case types.DATA_CONTRACT: {
        const dataContract = new DataContract(rawStateTransition.dataContract);

        stateTransition = new DataContractStateTransition(dataContract);
        break;
      }
      case types.DOCUMENTS: {
        stateTransition = new DocumentsStateTransition(rawStateTransition);
        break;
      }
      case types.IDENTITY_CREATE: {
        stateTransition = new IdentityCreateTransition(rawStateTransition);
        break;
      }
      default:
        throw new InvalidStateTransitionTypeError(rawStateTransition);
    }

    stateTransition
      .setSignature(rawStateTransition.signature)
      .setSignaturePublicKeyId(rawStateTransition.signaturePublicKeyId);

    return stateTransition;
  }

  return createStateTransition;
}

module.exports = createStateTransitionFactory;
