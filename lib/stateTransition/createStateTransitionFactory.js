const types = require('./stateTransitionTypes');

const DataContract = require('../dataContract/DataContract');

const DocumentsBatchTransition = require('../document/stateTransition/DocumentsBatchTransition');
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
   * RawDocumentsBatchTransition|
   * RawIdentityCreateTransition
   * } rawStateTransition
   * @return {DataContractStateTransition|DocumentsBatchTransition|IdentityCreateTransition}
   */
  function createStateTransition(rawStateTransition) {
    let stateTransition;

    switch (rawStateTransition.type) {
      case types.DATA_CONTRACT: {
        const dataContract = new DataContract(rawStateTransition.dataContract);

        stateTransition = new DataContractStateTransition(dataContract);
        stateTransition
          .setSignature(rawStateTransition.signature)
          .setSignaturePublicKeyId(rawStateTransition.signaturePublicKeyId);
        break;
      }
      case types.DOCUMENTS: {
        stateTransition = new DocumentsBatchTransition(rawStateTransition);
        stateTransition
          .setSignature(rawStateTransition.signature)
          .setSignaturePublicKeyId(rawStateTransition.signaturePublicKeyId);
        break;
      }
      case types.IDENTITY_CREATE: {
        stateTransition = new IdentityCreateTransition(rawStateTransition);
        break;
      }
      default:
        throw new InvalidStateTransitionTypeError(rawStateTransition);
    }

    return stateTransition;
  }

  return createStateTransition;
}

module.exports = createStateTransitionFactory;
