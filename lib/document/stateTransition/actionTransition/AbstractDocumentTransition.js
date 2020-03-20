class AbstractDocumentTransition {
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

AbstractDocumentTransition.ACTIONS = {
  CREATE: 1,
  REPLACE: 2,
  DELETE: 4,
};

AbstractDocumentTransition.ACTION_NAMES = {
  CREATE: 'create',
  REPLACE: 'replace',
  DELETE: 'delete',
};

module.exports = AbstractDocumentTransition;
