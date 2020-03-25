const types = require('./stateTransitionTypes');

const Document = require('../document/Document');

const DocumentsStateTransition = require('../document/stateTransition/DocumentsStateTransition');
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
   * RawDocumentsStateTransition|
   * RawIdentityCreateTransition
   * } rawStateTransition
   * @return {DataContractCreateTransition|DocumentsStateTransition|IdentityCreateTransition}
   */
  function createStateTransition(rawStateTransition) {
    let stateTransition;

    switch (rawStateTransition.type) {
      case types.DATA_CONTRACT:
        stateTransition = new DataContractCreateTransition(rawStateTransition);
        break;
      case types.DOCUMENTS: {
        const documents = rawStateTransition.documents.map((rawDocument, index) => {
          const document = new Document(rawDocument);

          document.setAction(rawStateTransition.actions[index]);

          return document;
        });

        stateTransition = new DocumentsStateTransition(documents);
        stateTransition
          .setSignature(rawStateTransition.signature)
          .setSignaturePublicKeyId(rawStateTransition.signaturePublicKeyId);
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
