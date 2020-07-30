const types = require('./stateTransitionTypes');

const DocumentsBatchTransition = require('../document/stateTransition/DocumentsBatchTransition');
const DataContractCreateTransition = require('../dataContract/stateTransition/DataContractCreateTransition');
const IdentityCreateTransition = require('../identity/stateTransitions/identityCreateTransition/IdentityCreateTransition');
const IdentityTopUpTransition = require('../identity/stateTransitions/identityTopUpTransition/IdentityTopUpTransition');

const InvalidStateTransitionTypeError = require('../errors/InvalidStateTransitionTypeError');
const DataContractNotPresentError = require('../errors/DataContractNotPresentError');
const InvalidDataContractIdError = require('../errors/InvalidDataContractIdError');

const typesToClasses = {
  [types.DATA_CONTRACT_CREATE]: DataContractCreateTransition,
  [types.DOCUMENTS_BATCH]: DocumentsBatchTransition,
  [types.IDENTITY_CREATE]: IdentityCreateTransition,
  [types.IDENTITY_TOP_UP]: IdentityTopUpTransition,
};

/**
 * @param {StateRepository} stateRepository
 *
 * @return {createStateTransitionFromObject}
 */
function createStateTransitionFromObjectFactory(stateRepository) {
  /**
   * @typedef createStateTransitionFromObject
   *
   * @param {
   * RawDataContractCreateTransition|
   * RawDocumentsBatchTransition|
   * RawIdentityCreateTransition|
   * RawIdentityTopUpTransition
   * } rawStateTransition
   *
   * @return {
   *   Promise<DataContractCreateTransition|DocumentsBatchTransition|IdentityCreateTransition>
   * }
   */
  async function createStateTransitionFromObject(rawStateTransition) {
    if (!typesToClasses[rawStateTransition.type]) {
      throw new InvalidStateTransitionTypeError(rawStateTransition);
    }

    if (rawStateTransition.type === types.DOCUMENTS_BATCH) {
      const dataContractPromises = rawStateTransition.transitions
        .map(async (documentTransition) => {
          if (!documentTransition.$dataContractId) {
            throw new InvalidDataContractIdError(documentTransition.$dataContractId);
          }

          const dataContract = await stateRepository.fetchDataContract(
            documentTransition.$dataContractId,
          );

          if (!dataContract) {
            throw new DataContractNotPresentError(rawStateTransition.$dataContractId);
          }

          return dataContract;
        });

      const dataContracts = await Promise.all(dataContractPromises);

      return new typesToClasses[rawStateTransition.type](rawStateTransition, dataContracts);
    }

    return new typesToClasses[rawStateTransition.type](rawStateTransition);
  }

  return createStateTransitionFromObject;
}

module.exports = createStateTransitionFromObjectFactory;