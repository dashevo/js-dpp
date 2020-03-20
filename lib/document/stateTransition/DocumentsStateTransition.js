const AbstractStateTransition = require('../../stateTransition/AbstractStateTransition');
const stateTransitionTypes = require('../../stateTransition/stateTransitionTypes');

const AbstractDocumentActionTransition = require('./actionTransition/AbstractDocumentActionTransition');
const DocumentCreateTransition = require('./actionTransition/DocumentCreateTransition');
const DocumentReplaceTransition = require('./actionTransition/DocumentReplaceTransition');
const DocumentDeleteTransition = require('./actionTransition/DocumentDeleteTransition');

const InvalidDocumentTransitionActionError = require('./errors/InvalidDocumentTransitionActionError');

class DocumentsStateTransition extends AbstractStateTransition {
  /**
   * @param {RawDocumentsStateTransition} rawStateTransition
   */
  constructor(rawStateTransition) {
    super();

    this.contractId = rawStateTransition.contractId;
    this.ownerId = rawStateTransition.ownerId;

    this.transitions = rawStateTransition.transitions.map((rawDocumentActionTransition) => {
      switch (rawDocumentActionTransition.$action) {
        case AbstractDocumentActionTransition.ACTIONS.CREATE:
          return new DocumentCreateTransition(rawDocumentActionTransition);
        case AbstractDocumentActionTransition.ACTIONS.REPLACE:
          return new DocumentReplaceTransition(rawDocumentActionTransition);
        case AbstractDocumentActionTransition.ACTIONS.DELETE:
          return new DocumentDeleteTransition(rawDocumentActionTransition);
        default:
          throw new InvalidDocumentTransitionActionError(rawDocumentActionTransition);
      }
    });
  }

  /**
   * Get State Transition type
   *
   * @return {number}
   */
  getType() {
    return stateTransitionTypes.DOCUMENTS;
  }

  /**
   * Get data contract id
   *
   * @return {string}
   */
  getDataContractId() {
    return this.contractId;
  }

  /**
   * Get owner id
   *
   * @return {string}
   */
  getOwnerId() {
    return this.ownerId;
  }

  /**
   * Get document action transitions
   *
   * @return {DocumentCreateTransition[]|DocumentReplaceTransition[]|DocumentDeleteTransition[]}
   */
  getTransitions() {
    return this.transitions;
  }

  /**
   * Get Documents State Transition as plain object
   *
   * @param {Object} [options]
   * @return {RawDocumentsStateTransition}
   */
  toJSON(options = {}) {
    return {
      ...super.toJSON(options),
      contractId: this.contractId,
      ownerId: this.ownerId,
      transitions: this.transitions.map((t) => t.toJSON()),
    };
  }
}

module.exports = DocumentsStateTransition;
