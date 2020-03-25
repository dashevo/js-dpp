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
  CREATE: 0,
  REPLACE: 1,
  // 2 reserved for UPDATE
  DELETE: 3,
};

AbstractDocumentTransition.ACTION_NAMES = {
  CREATE: 'create',
  REPLACE: 'replace',
  DELETE: 'delete',
};

module.exports = AbstractDocumentTransition;
