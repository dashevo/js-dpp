const AbstractStateTransition = require('../../stateTransition/AbstractStateTransition');
const AbstractStateTransitionIdentitySigned = require('../../stateTransition/AbstractStateTransitionIdentitySigned');
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

class DocumentsBatchTransition extends AbstractStateTransitionIdentitySigned {
  /**
   * @param {RawDocumentsBatchTransition} [rawStateTransition]
   * @param {DataContract[]} dataContracts
   */
  constructor(rawStateTransition = {}, dataContracts) {
    super(rawStateTransition);

    this.ownerId = rawStateTransition.ownerId;

    const dataContractsMap = dataContracts.reduce((map, dataContract) => ({
      ...map,
      [dataContract.getId()]: dataContract,
    }), {});

    this.transitions = (rawStateTransition.transitions || []).map((rawDocumentTransition) => (
      new actionsToClasses[rawDocumentTransition.$action](
        rawDocumentTransition,
        dataContractsMap[rawDocumentTransition.$dataContractId],
      )
    ));
  }

  /**
   * Get State Transition type
   *
   * @return {number}
   */
  getType() {
    return stateTransitionTypes.DOCUMENTS_BATCH;
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
   * Get system properties
   *
   * @protected
   *
   * @param {Object} [options]
   * @param {boolean} [options.skipSignature]
   * @param {boolean} [options.asJSON]
   *
   * @return {Object}
   */
  getSystemProperties(options = {}) {
    const asJSON = !!options.asJSON;

    const rawTransitions = asJSON
      ? this.getTransitions().map((t) => t.toJSON())
      : this.getTransitions().map((t) => t.toObject());

    return {
      ...super.getSystemProperties(options),
      ownerId: this.getOwnerId(),
      transitions: rawTransitions,
    };
  }

  /**
   * Create state transition from JSON
   *
   * @param {RawDocumentsBatchTransition} rawStateTransition
   * @param {DataContract[]} dataContracts
   *
   * @return {DocumentsBatchTransition}
   */
  static fromJSON(rawStateTransition, dataContracts) {
    return new DocumentsBatchTransition(
      AbstractStateTransition.translateFromJSON(rawStateTransition),
      dataContracts,
    );
  }
}

/**
 * @typedef {Object} RawDocumentsBatchTransition
 * @property {number} protocolVersion
 * @property {number} type
 * @property {string} ownerId
 * @property {
 *   Array.<RawDocumentCreateTransition|RawDocumentReplaceTransition|RawDocumentDeleteTransition>
 * } transitions
 * @property {number|null} signaturePublicKeyId
 * @property {string|null} signature
 */

module.exports = DocumentsBatchTransition;
