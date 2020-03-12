/**
 * @typedef {Object} RawDocumentsStateTransition
 * @property {number} protocolVersion
 * @property {number} type
 * @property {string} contractId
 * @property {string} ownerId
 * @property {
 *   Array.<RawCreateSubTransition|RawReplaceSubTransition|RawDeleteSubTransition>
 * } subTransitions
 * @property {number|null} signaturePublicKeyId
 * @property {string|null} signature
 */
