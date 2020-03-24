const DocumentFactory = require('../../document/DocumentFactory');

const getDocumentsFixture = require('./getDocumentsFixture');

function getDocumentTransitionFixture(documents = {}) {
  const {
    create: createDocuments,
    replace: replaceDocuments,
    delete: deleteDocuments,
  } = documents;

  const fixtureDocuments = getDocumentsFixture();

  const factory = new DocumentFactory(() => {}, () => {});

  return factory.createStateTransition({
    create: (createDocuments || fixtureDocuments),
    replace: replaceDocuments,
    delete: deleteDocuments,
  });
}

module.exports = getDocumentTransitionFixture;
