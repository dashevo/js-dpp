const DocumentCreateTransition = require('../../document/stateTransition/documentTransition/DocumentCreateTransition');
const DocumentReplaceTransition = require('../../document/stateTransition/documentTransition/DocumentReplaceTransition');
const DocumentDeleteTransition = require('../../document/stateTransition/documentTransition/DocumentDeleteTransition');

const getDocumentsFixture = require('./getDocumentsFixture');

function getDocumentTransitionFixture(documents = {}) {
  const {
    create: createDocuments,
    replace: replaceDocuments,
    delete: deleteDocuments,
  } = documents;

  const fixtureDocuments = getDocumentsFixture();

  const createTransitions = (createDocuments || fixtureDocuments).map((document) => (
    new DocumentCreateTransition({
      $id: document.getId(),
      $type: document.getType(),
      $entropy: document.getEntropy(),
      ...document.getData(),
    })
  ));

  const replaceTransitions = (replaceDocuments || []).map((document) => (
    new DocumentReplaceTransition({
      $id: document.getId(),
      $type: document.getType(),
      $rev: document.getRevision() + 1,
      ...document.getData(),
    })
  ));

  const deleteTransitions = (deleteDocuments || []).map((document) => (
    new DocumentDeleteTransition({
      $id: document.getId(),
      $type: document.getType(),
    })
  ));

  return [].concat(createTransitions).concat(replaceTransitions).concat(deleteTransitions);
}

module.exports = getDocumentTransitionFixture;
