const AbstractSubTransition = require('./AbstractSubTransition');

class DocumentReplaceTransition extends AbstractSubTransition {
  /**
   * @param {RawDocumentReplaceTransition} rawSubTransition
   */
  constructor(rawSubTransition) {
    super();

    const data = { ...rawSubTransition };

    this.id = rawSubTransition.$id;

    delete data.$id;
    delete data.$action;

    this.data = data;
  }

  /**
   * Get action
   *
   * @returns {string}
   */
  getAction() {
    return AbstractSubTransition.ACTIONS.REPLACE;
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
 */

module.exports = DocumentReplaceTransition;
