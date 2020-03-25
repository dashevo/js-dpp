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
    this.revision = rawTransition.$rev;

    delete data.$id;
    delete data.$type;
    delete data.$action;
    delete data.$rev;

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
   * Get document type
   *
   * @return {string}
   */
  getType() {
    return this.type;
  }

  /**
   * Get next document revision
   *
   * @return {number}
   */
  getRevision() {
    return this.revision;
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
      ...super.toJSON(),
      $id: this.getId(),
      $type: this.getType(),
      $rev: this.getRevision(),
      ...this.data,
    };
  }
}

/**
 * @typedef {Object} RawDocumentReplaceTransition
 * @property {number} $action
 * @property {string} $id
 * @property {string} $type
 * @property {number} $rev
 */

module.exports = DocumentReplaceTransition;
