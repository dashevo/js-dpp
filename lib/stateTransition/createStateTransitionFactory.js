const types = require('./stateTransitionTypes');

const Document = require('../document/Document');
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
        const documents = rawStateTransition.documents.map((rawDocument, index) => {
          const document = new Document(rawDocument);

          document.setAction(rawStateTransition.actions[index]);

          return document;
        });

        stateTransition = new DocumentsStateTransition(documents);
        break;
      }
      case types.IDENTITY_CREATE: {
        stateTransition = new IdentityCreateTransition(rawStateTransition);
        break;
      }
      default:
        throw new InvalidStateTransitionTypeError(rawStateTransition);
    }

    if (stateTransition.getType() !== types.IDENTITY_CREATE) {
      stateTransition
        .setSignature(rawStateTransition.signature)
        .setSignaturePublicKeyId(rawStateTransition.signaturePublicKeyId);
    }

    return stateTransition;
  }

  return createStateTransition;
}

module.exports = createStateTransitionFactory;
