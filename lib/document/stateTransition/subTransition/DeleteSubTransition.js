const AbstractSubTransition = require('./AbstractSubTransition');

class DeleteSubTransition {
  /**
   * @param {RawDeleteSubTransition} rawSubTransition
   */
  constructor(rawSubTransition) {
    this.id = rawSubTransition.$id;
  }

  /**
   * Get action
   *
   * @returns {string}
   */
  getAction() {
    return AbstractSubTransition.TYPES.DELETE;
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
   * @return {RawDeleteSubTransition}
   */
  toJSON() {
    return {
      ...super.toJSON(),
      $id: this.id,
    };
  }
}

/**
 * @typedef {Object} RawDeleteSubTransition
 * @property {string} $action
 * @property {string} $id
 */

module.exports = DeleteSubTransition;
