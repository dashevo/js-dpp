const DPObject = require('../../object/DPObject');

/**
 * @param {DPObject} originalObject
 * @param {DPObject} objectToCheck
 * @param {DPContract} dpContract
 *
 * @return {boolean}
 */
function isDuplicateByIndices(originalObject, objectToCheck, dpContract) {
  const indicesDefinition = dpContract.getDPObjectSchema(originalObject.getType()).indices;

  return indicesDefinition
    // For every index definition check if hashes match
    // accumulating overall boolean result
    .reduce((accumulator, definition) => {
      const properties = Object.keys(definition.properties);

      const [originalHash, hashToCheck] = properties
        .reduce(([originalAcc, toCheckAcc], property) => [
          `${originalAcc}:${originalObject.get(property)}`,
          `${toCheckAcc}:${objectToCheck.get(property)}`,
        ], ['', '']);

      return accumulator || (originalHash === hashToCheck);
    }, false);
}

/**
 * Find duplicate objects by unique indices
 *
 * @typedef findDuplicateDPObjectsByIndices
 *
 * @param {Object[]} rawDPObjects
 * @param {DPContract} dpContract
 *
 * @return {Object[]}
 */
function findDuplicateDPObjectsByIndices(rawDPObjects, dpContract) {
  // Convert raw objects to DPObject instances
  const dpObjects = rawDPObjects.map(o => new DPObject(o));

  const duplicateArrays = dpObjects
    // Filter out any DPObject without `indices` field
    .filter(dpObject => (
      dpContract.getDPObjectSchema(dpObject.getType()).indices !== undefined))
    // Prepare search function
    .map(dpObject => dpObjects
      // Exclude current object from the search
      .filter(o => o.getId() !== dpObject.getId())
      // Search and return an array of duplicates
      .reduce((foundObjects, objectToCheck) => {
        if (isDuplicateByIndices(dpObject, objectToCheck, dpContract)) {
          foundObjects.push(objectToCheck);
        }
        return foundObjects;
      }, []));

  // Flat map the results and return raw objects
  return duplicateArrays
    .reduce((accumulator, items) => accumulator.concat(items), [])
    .map(o => o.toJSON());
}

module.exports = findDuplicateDPObjectsByIndices;
