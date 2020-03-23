const AbstractStateTransition = require('../../stateTransition/AbstractStateTransition');
const stateTransitionTypes = require('../../stateTransition/stateTransitionTypes');

const AbstractDocumentTransition = require('./documentTransition/AbstractDocumentTransition');
const DocumentCreateTransition = require('./documentTransition/DocumentCreateTransition');
const DocumentReplaceTransition = require('./documentTransition/DocumentReplaceTransition');
const DocumentDeleteTransition = require('./documentTransition/DocumentDeleteTransition');

const actionsToClasses = {
  [AbstractDocumentTransition.ACTIONS.CREATE]: DocumentCreateTransition,
  [AbstractDocumentTransition.ACTIONS.REPLACE]: DocumentReplaceTransition,
  [AbstractDocumentTransition.ACTIONS.DELETE]: DocumentDeleteTransition,
};

class DocumentsStateTransition extends AbstractStateTransition {
  /**
   * @param {RawDocumentsStateTransition} rawStateTransition
   */
  constructor(rawStateTransition) {
    super();

    this.contractId = rawStateTransition.contractId;
    this.ownerId = rawStateTransition.ownerId;

    this.transitions = (rawStateTransition.transitions || []).map((rawDocumentActionTransition) => (
      new actionsToClasses[rawDocumentActionTransition.$action](rawDocumentActionTransition)
    ));
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

/**
 * @typedef {Object} RawDocumentsStateTransition
 * @property {number} protocolVersion
 * @property {number} type
 * @property {string} contractId
 * @property {string} ownerId
 * @property {
 *   Array.<RawDocumentCreateTransition|RawDocumentReplaceTransition|RawDocumentDeleteTransition>
 * } transitions
 * @property {number|null} signaturePublicKeyId
 * @property {string|null} signature
 */

module.exports = DocumentsStateTransition;
