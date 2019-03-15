const DPObject = require('../../object/DPObject');

/**
 * @param {DPObject} rawDPObject
 * @return {string}
 */
function createFingerPrint(rawDPObject) {
  return [
    rawDPObject.getType(),
    rawDPObject.getId(),
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
    .map(o => new DPObject(o))
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
