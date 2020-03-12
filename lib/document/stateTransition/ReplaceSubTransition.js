const AbstractSubTransition = require('./AbstractSubTransition');

class ReplaceSubTransition extends AbstractSubTransition {
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
    return AbstractSubTransition.TYPES.REPLACE;
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
   * @return {RawReplaceSubTransition}
   */
  toJSON() {
    return {
      ...this.toJSON(),
      document: this.document.toJSON(),
    };
  }
}

/**
 * @typedef {Object} RawReplaceSubTransition
 * @property {string} type
 * @property {RawDocument} document
 */

module.exports = ReplaceSubTransition;
