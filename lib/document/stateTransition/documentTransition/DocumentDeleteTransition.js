const AbstractDocumentTransition = require('./AbstractDocumentTransition');

class DocumentDeleteTransition extends AbstractDocumentTransition {
  /**
   * @param {RawDocumentDeleteTransition} rawTransition
   * @param {DataContract} dataContract
   */
  constructor(rawTransition, dataContract) {
    super(rawTransition, dataContract);

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
   * Get transition system properties
   *
   * @return {{ $id: string, $type: string }}
   */
  getSystemProperties() {
    return {
      $id: this.getId(),
      $type: this.getType(),
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
