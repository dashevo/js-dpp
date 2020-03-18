const AbstractSubTransition = require('./AbstractSubTransition');

class DocumentDeleteTransition extends AbstractSubTransition {
  /**
   * @param {RawDocumentDeleteTransition} rawSubTransition
   */
  constructor(rawSubTransition) {
    super();

    this.id = rawSubTransition.$id;
  }

  /**
   * Get action
   *
   * @returns {string}
   */
  getAction() {
    return AbstractSubTransition.ACTIONS.DELETE;
  }

  /**
   * Get id
   *
   * @returns {string}
   */
  getId() {
    return this.id;
  }

  /**
   * Get sub transition as a plain object
   *
   * @return {RawDocumentDeleteTransition}
   */
  toJSON() {
    return {
      ...super.toJSON(),
      $id: this.id,
    };
  }
}

/**
 * @typedef {Object} RawDocumentDeleteTransition
 * @property {string} $action
 * @property {string} $id
 */

module.exports = DocumentDeleteTransition;
