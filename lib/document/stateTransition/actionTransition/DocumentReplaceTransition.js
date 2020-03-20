const AbstractDocumentActionTransition = require('./AbstractDocumentActionTransition');

class DocumentReplaceTransition extends AbstractDocumentActionTransition {
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
   * @returns {string}
   */
  getAction() {
    return AbstractDocumentActionTransition.ACTIONS.REPLACE;
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
   * Get sub transition as a plain object
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
 * @property {string} $action
 * @property {string} $id
 * @property {string} $type
 */

module.exports = DocumentReplaceTransition;
