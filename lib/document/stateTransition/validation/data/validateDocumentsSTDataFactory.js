const DataTriggerExecutionContext = require('../../../../dataTrigger/DataTriggerExecutionContext');

const ValidationResult = require('../../../../validation/ValidationResult');

const DocumentAlreadyPresentError = require('../../../../errors/DocumentAlreadyPresentError');
const DocumentNotFoundError = require('../../../../errors/DocumentNotFoundError');
const DocumentOwnerIdMismatchError = require('../../../../errors/DocumentOwnerIdMismatchError');
const InvalidDocumentRevisionError = require('../../../../errors/InvalidDocumentRevisionError');
const InvalidDocumentActionError = require('../../../errors/InvalidDocumentActionError');
const DataContractNotPresentError = require('../../../../errors/DataContractNotPresentError');

const AbstractDocumentTransition = require('../../documentTransition/AbstractDocumentTransition');

/**
 *
 * @param {DataProvider} dataProvider
 * @param {fetchDocuments} fetchDocuments
 * @param {validateDocumentsUniquenessByIndices} validateDocumentsUniquenessByIndices
 * @param {executeDataTriggers} executeDataTriggers
 * @return {validateDataContractSTData}
 */
function validateDocumentsSTDataFactory(
  dataProvider,
  fetchDocuments,
  validateDocumentsUniquenessByIndices,
  executeDataTriggers,
) {
  /**
   * @typedef validateDocumentsSTData
   * @param {DocumentsBatchTransition} stateTransition
   * @return {ValidationResult}
   */
  async function validateDocumentsSTData(stateTransition) {
    const result = new ValidationResult();

    const ownerId = stateTransition.getOwnerId();

    // Data contract must exist
    const dataContractId = stateTransition.getDataContractId();
    const dataContract = await dataProvider.fetchDataContract(dataContractId);

    if (!dataContract) {
      result.addError(
        new DataContractNotPresentError(dataContractId),
      );
    }

    if (!result.isValid()) {
      return result;
    }

    // Validate document action, ownerId and revision
    const documentActionTransitions = stateTransition.getTransitions();
    const fetchedDocuments = await fetchDocuments(dataContractId, documentActionTransitions);

    documentActionTransitions
      .forEach((actionTransition) => {
        const fetchedDocument = fetchedDocuments
          .find((d) => actionTransition.getId() === d.getId());

        switch (actionTransition.getAction()) {
          case AbstractDocumentTransition.ACTIONS.CREATE:
            if (fetchedDocument) {
              result.addError(
                new DocumentAlreadyPresentError(actionTransition, fetchedDocument),
              );
            }
            break;
          case AbstractDocumentTransition.ACTIONS.REPLACE: {
            if (
              fetchedDocument
              && actionTransition.getRevision() !== fetchedDocument.getRevision() + 1
            ) {
              result.addError(
                new InvalidDocumentRevisionError(actionTransition, fetchedDocument),
              );
            }
          }
          // eslint-disable-next-line no-fallthrough
          case AbstractDocumentTransition.ACTIONS.DELETE: {
            if (!fetchedDocument) {
              result.addError(
                new DocumentNotFoundError(actionTransition),
              );

              break;
            }

            if (fetchedDocument.getOwnerId() !== stateTransition.getOwnerId()) {
              result.addError(
                new DocumentOwnerIdMismatchError(actionTransition, fetchedDocument),
              );
            }

            break;
          }
          default:
            throw new InvalidDocumentActionError(actionTransition);
        }
      });

    if (!result.isValid()) {
      return result;
    }

    // Validate unique indices
    const nonDeleteActionTransitions = documentActionTransitions
      .filter((d) => d.getAction() !== AbstractDocumentTransition.ACTIONS.DELETE);

    if (nonDeleteActionTransitions.length > 0) {
      result.merge(
        await validateDocumentsUniquenessByIndices(
          ownerId,
          nonDeleteActionTransitions,
          dataContract,
        ),
      );

      if (!result.isValid()) {
        return result;
      }
    }

    // Run Data Triggers
    const dataTriggersExecutionContext = new DataTriggerExecutionContext(
      dataProvider,
      ownerId,
      dataContract,
    );

    const dataTriggersExecutionResults = await executeDataTriggers(
      documentActionTransitions,
      dataTriggersExecutionContext,
    );

    dataTriggersExecutionResults.forEach((dataTriggerExecutionResult) => {
      if (!dataTriggerExecutionResult.isOk()) {
        result.addError(...dataTriggerExecutionResult.getErrors());
      }
    });

    return result;
  }

  return validateDocumentsSTData;
}

module.exports = validateDocumentsSTDataFactory;
