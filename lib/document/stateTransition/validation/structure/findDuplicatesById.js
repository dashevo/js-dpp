/**
 * @param {
 *   RawDocumentCreateTransition|RawDocumentReplaceTransition|RawDocumentDeleteTransition
 * } transition
 *
 * @return {string}
 */
function createFingerPrint(transition) {
  return [
    transition.$type,
    transition.$id,
  ].join(':');
}

/**
 * Find duplicates
 *
 * @typedef findDuplicatesById
 *
 * @param {
 *   Array.<RawDocumentCreateTransition|RawDocumentReplaceTransition|RawDocumentDeleteTransition>
 * } transitions
 *
 * @return {
 *   Array.<RawDocumentCreateTransition|RawDocumentReplaceTransition|RawDocumentDeleteTransition>
 * }
 */
function findDuplicatesById(transitions) {
  const fingerprints = {};
  const duplicates = [];

  transitions
    .forEach((transition) => {
      const fingerprint = createFingerPrint(transition);

      if (!fingerprints[fingerprint]) {
        fingerprints[fingerprint] = [];
      }

      fingerprints[fingerprint].push(transition);

      if (fingerprints[fingerprint].length > 1) {
        duplicates.push(...fingerprints[fingerprint]);
      }
    });

  return duplicates;
}

module.exports = findDuplicatesById;
