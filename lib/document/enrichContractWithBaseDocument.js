const documentBaseSchema = require('../../schema/base/document');

/**
 * @typedef {enrichContractWithBaseDocument}
 * @param {Contract} contract
 * @return {RawContract}
 */
function enrichContractWithBaseDocument(contract, excludeFromRequired = ['$meta']) {
  const rawContract = contract.toJSON();

  const jsonContract = JSON.stringify(rawContract);
  const clonedContract = JSON.parse(jsonContract);

  delete clonedContract.$schema;

  const { documents: clonedDocuments } = clonedContract;

  Object.keys(clonedDocuments).forEach((type) => {
    const clonedDocument = clonedDocuments[type];

    const { properties: baseDocumentProperties } = documentBaseSchema;

    if (!clonedDocument.required) {
      clonedDocument.required = [];
    }

    Object.keys(baseDocumentProperties).forEach((name) => {
      clonedDocument.properties[name] = baseDocumentProperties[name];
      if (excludeFromRequired.indexOf(name) === -1) {
        clonedDocument.required.push(name);
      }
    });
  });

  return clonedContract;
}

module.exports = enrichContractWithBaseDocument;
