const AbstractDocumentTransition = require('./AbstractDocumentTransition');

class DocumentDeleteTransition extends AbstractDocumentTransition {
  /**
   * Get action
   *
   * @returns {number}
   */
  getAction() {
    return AbstractDocumentTransition.ACTIONS.DELETE;
  }

  /**
   * Create document transition from JSON
   *
   * @param {RawDocumentDeleteTransition} rawDocumentTransition
   * @param {DataContract} dataContract
   *
   * @return {DocumentDeleteTransition}
   */
  static fromJSON(rawDocumentTransition, dataContract) {
    const plainObjectDocumentTransition = AbstractDocumentTransition.translateJsonToObject(
      rawDocumentTransition, dataContract,
    );

    return new DocumentDeleteTransition(plainObjectDocumentTransition, dataContract);
  }
}

/**
 * @typedef {RawDocumentTransition & Object} RawDocumentDeleteTransition
 */

/**
 * @typedef {JsonDocumentTransition & Object} JsonDocumentDeleteTransition
 */

DocumentDeleteTransition.ENCODED_PROPERTIES = {
  ...AbstractDocumentTransition.ENCODED_PROPERTIES,
};

module.exports = DocumentDeleteTransition;
