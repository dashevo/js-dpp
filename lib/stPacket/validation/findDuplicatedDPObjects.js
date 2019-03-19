const Document = require('../../document/Document');

/**
 * @param {Document} dpObject
 * @return {string}
 */
function createFingerPrint(dpObject) {
  return [
    dpObject.getType(),
    dpObject.getId(),
  ].join(':');
}

/**
 * Find duplicates
 *
 * @typedef findDuplicatedDPObjects
 * @param {Object[]} rawDPObjects
 * @return {Object[]}
 */
function findDuplicatedDPObjects(rawDPObjects) {
  const fingerprints = {};
  const duplicates = [];

  rawDPObjects
    .map(o => new Document(o))
    .forEach((dpObject) => {
      const fingerprint = createFingerPrint(dpObject);

      if (!fingerprints[fingerprint]) {
        fingerprints[fingerprint] = [];
      }

      fingerprints[fingerprint].push(dpObject.toJSON());

      if (fingerprints[fingerprint].length > 1) {
        duplicates.push(...fingerprints[fingerprint]);
      }
    });

  return duplicates;
}

module.exports = findDuplicatedDPObjects;
