/**
 * @param {Document} originalTransition
 * @param {Document} transitionToCheck
 * @param {Object} typeIndices
 *
 * @return {boolean}
 */
function isDuplicateByIndices(originalTransition, transitionToCheck, typeIndices) {
  return typeIndices
    // For every index definition check if hashes match
    // accumulating overall boolean result
    .reduce((accumulator, definition) => {
      const [originalHash, hashToCheck] = definition.properties
        .reduce(([originalAcc, toCheckAcc], property) => {
          const propertyName = Object.keys(property)[0];
          return [
            `${originalAcc}:${originalTransition[propertyName]}`,
            `${toCheckAcc}:${transitionToCheck[propertyName]}`,
          ];
        }, ['', '']);

      return accumulator || (originalHash === hashToCheck);
    }, false);
}

/**
 * Find duplicate objects by unique indices
 *
 * @typedef findDuplicatesByIndices
 *
 * @param {
 *   Array.<RawDocumentCreateTransition|RawDocumentReplaceTransition>
 * } transitions
 * @param {DataContract} dataContract
 *
 * @return {
 *   Array.<RawDocumentCreateTransition|RawDocumentReplaceTransition>
 * }
 */
function findDuplicatesByIndices(transitions, dataContract) {
  const groupsObject = transitions
    // Group transitions by it's type, enrich them by type's unique indices
    .reduce((groups, transition) => {
      const { $type: type } = transition;
      const typeIndices = (dataContract.getDocumentSchema(type).indices || []);

      // Init empty group
      if (!groups[type]) {
        // eslint-disable-next-line no-param-reassign
        groups[type] = {
          items: [],
          // init group with only it's unique indices
          indices: typeIndices.filter((index) => index.unique),
        };
      }

      groups[type].items.push(transition);

      return groups;
    }, {});

  const duplicateArrays = Object.values(groupsObject)
    // Filter out groups without unique indices
    .filter((group) => group.indices.length > 0)
    // Filter out groups with only one object
    .filter((group) => group.items.length > 1)
    .map((group) => group.items
      // Flat map found duplicates in a group
      .reduce((foundGroupDuplicates, transition) => {
        // For every transition in a group make duplicate search
        const duplicates = group.items
          // Exclude current transition from search
          .filter((o) => o.$id !== transition.$id)
          .reduce((foundDuplicates, transitionsToCheck) => {
            if (isDuplicateByIndices(transition, transitionsToCheck, group.indices)) {
              foundDuplicates.push(transitionsToCheck);
            }
            return foundDuplicates;
          }, []);

        return foundGroupDuplicates.concat(duplicates);
      }, []));

  // Flat map the results and return raw items
  return duplicateArrays
    .reduce((accumulator, items) => accumulator.concat(items), []);
}

module.exports = findDuplicatesByIndices;
