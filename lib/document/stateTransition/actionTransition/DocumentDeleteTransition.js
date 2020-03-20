const AbstractDocumentTransition = require('./AbstractDocumentTransition');

class DocumentDeleteTransition extends AbstractDocumentTransition {
  /**
   * @param {RawDocumentDeleteTransition} rawTransition
   */
  constructor(rawTransition) {
    super();

    this.id = rawTransition.$id;
    this.type = rawTransition.$type;
  }

  /**
   * Get action
   *
   * @returns {number}
   */
  getAction() {
    return AbstractDocumentTransition.ACTIONS.DELETE;
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
   * Get type
   *
   * @returns {*}
   */
  getType() {
    return this.type;
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
      $type: this.type,
    };
  }
}

/**
 * @typedef {Object} RawDocumentDeleteTransition
 * @property {number} $action
 * @property {string} $id
 * @property {string} $type
 */

module.exports = DocumentDeleteTransition;
