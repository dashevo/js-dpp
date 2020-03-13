const types = require('./stateTransitionTypes');

const DataContract = require('../dataContract/DataContract');

const DocumentsStateTransition = require('../document/stateTransition/DocumentsStateTransition');
const DataContractStateTransition = require('../dataContract/stateTransition/DataContractStateTransition');
const IdentityCreateTransition = require('../identity/stateTransitions/identityCreateTransition/IdentityCreateTransition');

const AbstractSubTransition = require('../document/stateTransition/subTransition/AbstractSubTransition');
const CreateSubTransition = require('../document/stateTransition/subTransition/CreateSubTransition');
const ReplaceSubTransition = require('../document/stateTransition/subTransition/ReplaceSubTransition');
const DeleteSubTransition = require('../document/stateTransition/subTransition/DeleteSubTransition');

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
        const subTransitions = rawStateTransition.subTransitions.map((rawSubTransition) => {
          switch (rawSubTransition.type) {
            case AbstractSubTransition.TYPES.CREATE:
              return new CreateSubTransition(rawSubTransition);
            case AbstractSubTransition.TYPES.REPLACE:
              return new ReplaceSubTransition(rawSubTransition);
            case AbstractSubTransition.TYPES.DELETE:
              return new DeleteSubTransition(rawSubTransition);
            default:
              throw new Error('Unknown sub transition type');
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
