/**
 * @classdesc StateRepository interface definition
 *
 * @async
 * @name StateRepository
 * @class
 */

/**
 * Fetch Data Contract by ID
 *
 * @async
 * @method
 * @name StateRepository#fetchDataContract
 * @param {string} id
 * @returns {Promise<DataContract|null>}
 */

/**
 * Fetch Documents by Data Contract ID and type
 *
 * @async
 * @method
 * @name StateRepository#fetchDocuments
 * @param {string} contractId
 * @param {string} type
 * @param {{ where: Object }} [options]
 * @returns {Promise<Document[]>}
 */

/**
 * Fetch transaction by ID
 *
 * @async
 * @method
 * @name StateRepository#fetchTransaction
 * @param {string} id
 * @returns {Promise<Object|null>}
 */

/**
 * Fetch identity by ID
 *
 * @async
 * @method
 * @name StateRepository#fetchIdentity
 * @param {string} id
 * @returns {Promise<Identity|null>}
 */
