const Document = require('../../document/Document');

/**
 * @param {Document} originalDocument
 * @param {Document} documentToCheck
 * @param {Object} typeIndices
 *
 * @return {boolean}
 */
function isDuplicateByIndices(originalDocument, documentToCheck, typeIndices) {
  return typeIndices
    // For every index definition check if hashes match
    // accumulating overall boolean result
    .reduce((accumulator, definition) => {
      const [originalHash, hashToCheck] = definition.properties
        .reduce(([originalAcc, toCheckAcc], property) => {
          const propertyName = Object.keys(property)[0];
          return [
            `${originalAcc}:${originalDocument.get(propertyName)}`,
            `${toCheckAcc}:${documentToCheck.get(propertyName)}`,
          ];
        }, ['', '']);

      return accumulator || (originalHash === hashToCheck);
    }, false);
}

/**
 * Find duplicate objects by unique indices
 *
 * @typedef findDuplicateDPObjectsByIndices
 *
 * @param {Object[]} rawDocuments
 * @param {DPContract} dpContract
 *
 * @return {Object[]}
 */
function findDuplicateDPObjectsByIndices(rawDocuments, dpContract) {
  // Convert raw documents to Document instances
  const documents = rawDocuments.map(o => new Document(o));

  const groupsObject = documents
    // Group documents by it's type, enrich them by type's unique indices
    .reduce((groups, document) => {
      const type = document.getType();
      const typeIndices = (dpContract.getDPObjectSchema(type).indices || []);

      // Init empty group
      if (!groups[type]) {
        // eslint-disable-next-line no-param-reassign
        groups[type] = {
          items: [],
          // init group with only it's unique indices
          indices: typeIndices.filter(index => index.unique),
        };
      }

      groups[type].items.push(document);

      return groups;
    }, {});

  const duplicateArrays = Object.values(groupsObject)
    // Filter out groups without unique indices
    .filter(group => group.indices.length > 0)
    // Filter out groups with only one object
    .filter(group => group.items.length > 1)
    .map(group => group.items
      // Flat map found duplicates in a group
      .reduce((foundGroupObjects, document) => {
        // For every object in a group make duplicate search
        const objects = group.items
          // Exclude current object from search
          .filter(o => o.getId() !== document.getId())
          .reduce((foundObjects, objectToCheck) => {
            if (isDuplicateByIndices(document, objectToCheck, group.indices)) {
              foundObjects.push(objectToCheck);
            }
            return foundObjects;
          }, []);

        return foundGroupObjects.concat(objects);
      }, []));

  // Flat map the results and return raw documents
  return duplicateArrays
    .reduce((accumulator, items) => accumulator.concat(items), [])
    .map(o => o.toJSON());
}

module.exports = findDuplicateDPObjectsByIndices;
