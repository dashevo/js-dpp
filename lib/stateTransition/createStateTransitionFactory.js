const types = require('./stateTransitionTypes');

const DataContract = require('../dataContract/DataContract');

const DocumentsStateTransition = require('../document/stateTransition/DocumentsStateTransition');
const DataContractStateTransition = require('../dataContract/stateTransition/DataContractStateTransition');
const IdentityCreateTransition = require('../identity/stateTransitions/identityCreateTransition/IdentityCreateTransition');

const AbstractDocumentActionTransition = require('../document/stateTransition/subTransition/AbstractDocumentActionTransition');
const DocumentCreateTransition = require('../document/stateTransition/subTransition/DocumentCreateTransition');
const DocumentReplaceTransition = require('../document/stateTransition/subTransition/DocumentReplaceTransition');
const DocumentDeleteTransition = require('../document/stateTransition/subTransition/DocumentDeleteTransition');

const InvalidStateTransitionTypeError = require('../errors/InvalidStateTransitionTypeError');
const InvalidDocumentTransitionActionError = require('../errors/InvalidDocumentTransitionActionError');

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
        const subTransitions = rawStateTransition.subTransitions.map((rawSubTransition) => {
          switch (rawSubTransition.$action) {
            case AbstractDocumentActionTransition.ACTIONS.CREATE:
              return new DocumentCreateTransition(rawSubTransition);
            case AbstractDocumentActionTransition.ACTIONS.REPLACE:
              return new DocumentReplaceTransition(rawSubTransition);
            case AbstractDocumentActionTransition.ACTIONS.DELETE:
              return new DocumentDeleteTransition(rawSubTransition);
            default:
              throw new InvalidDocumentTransitionActionError(rawSubTransition);
          }
        });

        stateTransition = new DocumentsStateTransition(
          rawStateTransition.contractId,
          rawStateTransition.ownerId,
          subTransitions,
        );
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
