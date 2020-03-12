const AbstractSubTransition = require('./AbstractSubTransition');

class CreateSubTransition extends AbstractSubTransition {
  /**
   * @param {Document} document
   */
  constructor(document) {
    super();
    this.document = document;
  }

  /**
   * Get type
   *
   * @returns {string}
   */
  getType() {
    return AbstractSubTransition.TYPES.CREATE;
  }

  /**
   * Get document
   *
   * @returns {Document}
   */
  getDocument() {
    return this.document;
  }

  /**
   * Get sub transition as a plain object
   *
   * @return {RawCreateSubTransition}
   */
  toJSON() {
    return {
      ...super.toJSON(),
      document: this.document.toJSON(),
    };
  }
}

/**
 * @typedef {Object} RawCreateSubTransition
 * @property {string} type
 * @property {RawDocument} document
 */

module.exports = CreateSubTransition;
