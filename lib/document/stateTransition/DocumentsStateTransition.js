const AbstractStateTransition = require('../../stateTransition/AbstractStateTransition');
const stateTransitionTypes = require('../../stateTransition/stateTransitionTypes');

class DocumentsStateTransition extends AbstractStateTransition {
  /**
   * @param {string} contractId
   * @param {string} ownerId
   * @param {AbstractSubTransition[]} subTransitions
   */
  constructor(contractId, ownerId, subTransitions) {
    super();

    this.contractId = contractId;
    this.ownerId = ownerId;
    this.subTransitions = subTransitions;
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
   * @return {Array.<CreateSubTransition|ReplaceSubTransition|DeleteSubTransition>}
   */
  getSubTransitions() {
    return this.subTransitions;
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
      subTransitions: this.subTransitions.map((t) => t.toJSON()),
    };
  }
}

module.exports = DocumentsStateTransition;
