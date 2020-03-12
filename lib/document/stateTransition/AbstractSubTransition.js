class AbstractSubTransition {
  /**
   * @abstract
   */
  getType() {
    throw new Error('Not implemented');
  }

  /**
   * Get JSON representation
   *
   * @returns { {type: string} }
   */
  toJSON() {
    return {
      type: this.getType(),
    };
  }
}

AbstractSubTransition.TYPES = {
  CREATE: 'create',
  REPLACE: 'replace',
  DELETE: 'delete',
};

module.exports = AbstractSubTransition;
