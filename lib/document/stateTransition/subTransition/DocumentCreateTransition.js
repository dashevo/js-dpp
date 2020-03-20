const AbstractDocumentActionTransition = require('./AbstractDocumentActionTransition');

class DocumentCreateTransition extends AbstractDocumentActionTransition {
  /**
   * @param {RawDocumentCreateTransition} rawSubTransition
   */
  constructor(rawSubTransition) {
    super();

    const data = { ...rawSubTransition };

    this.id = rawSubTransition.$id;
    this.type = rawSubTransition.$type;
    this.entropy = rawSubTransition.$entropy;

    delete data.$id;
    delete data.$type;
    delete data.$entropy;
    delete data.$action;

    this.data = data;
  }

  /**
   * Get action
   *
   * @returns {string}
   */
  getAction() {
    return AbstractDocumentActionTransition.ACTIONS.CREATE;
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
   * @returns {string}
   */
  getType() {
    return this.type;
  }

  /**
   * Get entropy
   *
   * @returns {string}
   */
  getEntropy() {
    return this.entropy;
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
   * @return {RawDocumentCreateTransition}
   */
  toJSON() {
    return {
      ...super.toJSON(),
      $id: this.id,
      $type: this.type,
      $entropy: this.entropy,
      ...this.documentData,
    };
  }
}

/**
 * @typedef {Object} RawDocumentCreateTransition
 * @property {string} $action
 * @property {string} $id
 * @property {string} $type
 * @property {string} $entropy
 */

module.exports = DocumentCreateTransition;
