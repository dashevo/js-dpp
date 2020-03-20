class AbstractDocumentActionTransition {
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

AbstractDocumentActionTransition.ACTIONS = {
  CREATE: 'create',
  REPLACE: 'replace',
  DELETE: 'delete',
};

module.exports = AbstractDocumentActionTransition;
