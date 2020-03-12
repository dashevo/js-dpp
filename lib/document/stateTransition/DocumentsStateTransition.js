const AbstractStateTransition = require('../../stateTransition/AbstractStateTransition');
const stateTransitionTypes = require('../../stateTransition/stateTransitionTypes');

const Document = require('../Document');

const AbstractSubTransition = require('./AbstractSubTransition');
const CreateSubTransition = require('./CreateSubTransition');
const ReplaceSubTransition = require('./ReplaceSubTransition');
const DeleteSubTransition = require('./DeleteSubTransition');

class DocumentsStateTransition extends AbstractStateTransition {
  /**
   * @param {RawDocumentsStateTransition} rawStateTransition
   */
  constructor(rawStateTransition) {
    super();

    const subTransitions = rawStateTransition.subTransitions.map((rawSubTransition) => {
      if (rawSubTransition.type === AbstractSubTransition.TYPES.CREATE) {
        const document = new Document(rawSubTransition.document);
        return new CreateSubTransition(document);
      }

      if (rawSubTransition.type === AbstractSubTransition.TYPES.REPLACE) {
        const document = new Document(rawSubTransition.document);
        return new ReplaceSubTransition(document);
      }

      return new DeleteSubTransition(rawSubTransition.documentId);
    });

    this.subTransitions = subTransitions;
  }

  /**
   * Get State Transition type
   *
   * @return {number}
   */
  getType() {
    return stateTransitionTypes.DOCUMENTS;
  }

  /**
   * Get sub transitions
   *
   * @return {Array.<CreateSubTransition|ReplaceSubTransition|DeleteSubTransition>}
   */
  getSubTransitions() {
    return this.subTransitions;
  }

  /**
   * Get Documents State Transition as plain object
   *
   * @param {Object} [options]
   * @return {RawDocumentsStateTransition}
   */
  toJSON(options = {}) {
    return {
      ...super.toJSON(options),
      subTransitions: this.subTransitions.map((t) => t.toJSON()),
    };
  }
}

module.exports = DocumentsStateTransition;
