const AbstractStateTransition = require('../../stateTransition/AbstractStateTransition');
const stateTransitionTypes = require('../../stateTransition/stateTransitionTypes');

const AbstractSubTransition = require('./subTransition/AbstractSubTransition');
const CreateSubTransition = require('./subTransition/CreateSubTransition');
const ReplaceSubTransition = require('./subTransition/ReplaceSubTransition');
const DeleteSubTransition = require('./subTransition/DeleteSubTransition');

class DocumentsStateTransition extends AbstractStateTransition {
  /**
   * @param {RawDocumentsStateTransition} rawStateTransition
   */
  constructor(rawStateTransition) {
    super();

    const subTransitions = rawStateTransition.subTransitions.map((rawSubTransition) => {
      switch (rawSubTransition.type) {
        case AbstractSubTransition.TYPES.CREATE:
          return new CreateSubTransition(rawSubTransition);
        case AbstractSubTransition.TYPES.REPLACE:
          return new ReplaceSubTransition(rawSubTransition);
        case AbstractSubTransition.TYPES.DELETE:
          return new DeleteSubTransition(rawSubTransition);
        default:
          throw new Error('Unknown sub transition type');
      }
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
