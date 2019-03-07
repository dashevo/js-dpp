const DPObject = require('../../object/DPObject');

/**
 * @param {DPObject} originalObject
 * @param {DPObject} objectToCheck
 *
 * @return {boolean}
 */
function isDuplicateByIndices(originalObject, objectToCheck) {
  const indicesDefinition = originalObject.get('indices');
  const indexedProperties = Object.keys(indicesDefinition.properties);

  const [originalObjectHash, objectToCheckHash] = indexedProperties
    .reduce(([originalHash, hashToCheck], property) => [
      `${originalHash}:${originalObject.get(property)}`,
      `${hashToCheck}:${objectToCheck.get(property)}`,
    ], ['', '']);

  return originalObjectHash === objectToCheckHash;
}

/**
 * Find duplicate objects by unique indices
 *
 * @typedef findDuplicateDPObjectsByIndices
 *
 * @param {Object[]} rawDPObjects
 *
 * @return {Object[]}
 */
function findDuplicateDPObjectsByIndices(rawDPObjects) {
  // Convert raw objects to DPObject instances
  const dpObjects = rawDPObjects.map(o => new DPObject(o));

  const duplicatePromises = dpObjects
    // Filter out any DPObject without `indices` field
    .filter(dpObject => dpObject.get('indices') !== undefined)
    // Prepare search function promise
    .map(dpObject => new Promise((resolve) => {
      const duplicates = dpObjects
        // Exclude current object from the search
        .filter(o => o.getId() !== dpObject.getId())
        // Search and return an array of duplicates
        .reduce((foundObjects, objectToCheck) => {
          if (isDuplicateByIndices(dpObject, objectToCheck)) {
            foundObjects.push(objectToCheck);
          }
          return foundObjects;
        }, []);

      resolve(duplicates);
    }));

  // Flat map the result of promises
  const duplicates = Promise.all(duplicatePromises)
    .reduce((accumulator, items) => accumulator.concat(items), []);

  // Return back duplicates
  // converting them back to raw objects
  return duplicates.map(o => o.toJSON());
}

module.exports = findDuplicateDPObjectsByIndices;
