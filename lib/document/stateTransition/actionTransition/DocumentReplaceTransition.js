const AbstractDocumentTransition = require('./AbstractDocumentTransition');

class DocumentReplaceTransition extends AbstractDocumentTransition {
  /**
   * @param {RawDocumentReplaceTransition} rawTransition
   */
  constructor(rawTransition) {
    super();

    const data = { ...rawTransition };

    this.id = rawTransition.$id;
    this.type = rawTransition.$type;

    delete data.$id;
    delete data.$type;
    delete data.$action;

    this.data = data;
  }

  /**
   * Get action
   *
   * @returns {number}
   */
  getAction() {
    return AbstractDocumentTransition.ACTIONS.REPLACE;
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
   * Get data
   *
   * @returns {Object}
   */
  getData() {
    return this.data;
  }

  /**
   * Get document transition as a plain object
   *
   * @return {RawDocumentReplaceTransition}
   */
  toJSON() {
    return {
      ...this.toJSON(),
      $id: this.id,
      ...this.data,
    };
  }
}

/**
 * @typedef {Object} RawDocumentReplaceTransition
 * @property {number} $action
 * @property {string} $id
 * @property {string} $type
 */

module.exports = DocumentReplaceTransition;
