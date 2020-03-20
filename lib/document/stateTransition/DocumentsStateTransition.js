const AbstractStateTransition = require('../../stateTransition/AbstractStateTransition');
const stateTransitionTypes = require('../../stateTransition/stateTransitionTypes');

class DocumentsStateTransition extends AbstractStateTransition {
  /**
   * @param {string} contractId
   * @param {string} ownerId
   * @param {AbstractDocumentActionTransition[]} transitions
   */
  constructor(contractId, ownerId, transitions) {
    super();

    this.contractId = contractId;
    this.ownerId = ownerId;
    this.transitions = transitions;
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
   * Get sub transitions
   *
   * @return {AbstractDocumentActionTransition[]}
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
