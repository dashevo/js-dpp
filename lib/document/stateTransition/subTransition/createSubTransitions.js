const AbstractSubTransition = require('./AbstractSubTransition');

const CreateSubTransition = require('./CreateSubTransition');
const ReplaceSubTransition = require('./ReplaceSubTransition');
const DeleteSubTransition = require('./DeleteSubTransition');

/**
 * Convert sub transition map to a list of sub transitions
 * for a document state transition
 *
 * @typedef createSubTransitions
 *
 * @param {SubTransitionsMap} subTransitionsMap
 *
 * @return {AbstractSubTransition[]}
 */
function createSubTransitions(subTransitionsMap) {
  const {
    [AbstractSubTransition.TYPES.CREATE]: createDocuments,
    [AbstractSubTransition.TYPES.REPLACE]: replaceDocuments,
    [AbstractSubTransition.TYPES.DELETE]: deleteDocuments,
  } = subTransitionsMap;

  const createDocumentSubTransitions = (createDocuments || [])
    .map((document) => new CreateSubTransition(document));

  const replaceDocumentSubTransitions = (replaceDocuments || [])
    .map((document) => new ReplaceSubTransition(document));

  const deleteDocumentSubTransitions = (deleteDocuments || [])
    .map((document) => new DeleteSubTransition(document.getId()));

  return createDocumentSubTransitions
    .concat(replaceDocumentSubTransitions)
    .concat(deleteDocumentSubTransitions);
}

/**
 * @typedef SubTransitionsMap
 * @property {Document[]} create
 * @property {Document[]} replace
 * @property {Document[]} delete
 */

module.exports = createSubTransitions;
