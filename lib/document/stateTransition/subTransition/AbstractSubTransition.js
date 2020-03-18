class AbstractSubTransition {
  /**
   * @abstract
   */
  getAction() {
    throw new Error('Not implemented');
  }

  /**
   * Get JSON representation
   *
   * @returns { { $action: string } }
   */
  toJSON() {
    return {
      $action: this.getAction(),
    };
  }
}

AbstractSubTransition.TYPES = {
  CREATE: 'create',
  REPLACE: 'replace',
  DELETE: 'delete',
};

module.exports = AbstractSubTransition;
