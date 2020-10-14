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
 * @param {Buffer} id
 * @returns {Promise<DataContract|null>}
 */

/**
 * Store Data Contract
 *
 * @async
 * @method
 * @name StateRepository#storeDataContract
 * @param {DataContract} dataContract
 * @returns {Promise<void>}
 */

/**
 * Fetch Documents by Data Contract ID and type
 *
 * @async
 * @method
 * @name StateRepository#fetchDocuments
 * @param {Buffer} contractId
 * @param {string} type
 * @param {{ where: Object }} [options]
 * @returns {Promise<Document[]>}
 */

/**
 * Store document
 *
 * @async
 * @method
 * @name StateRepository#storeDocument
 * @param {Document} document
 * @returns {Promise<void>}
 */

/**
 * Remove document
 *
 * @async
 * @method
 * @name StateRepository#removeDocument
 * @param {string} contractId
 * @param {string} type
 * @param {Buffer} id
 * @returns {Promise<void>}
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
 * @param {Buffer} id
 * @returns {Promise<Identity|null>}
 */

/**
 * Store identity
 *
 * @async
 * @method
 * @name StateRepository#storeIdentity
 * @param {Identity} identity
 * @returns {Promise<void>}
 */

/**
 * Store public keys hashes and identity id pair
 *
 * @async
 * @method
 * @name StateRepository#storeIdentityPublicKeyHashes
 * @param {Buffer} identityId
 * @param {Buffer[]} publicKeyHashes
 * @returns {Promise<void>}
 */

/**
 * Fetch identity ids by public keys hashes
 *
 * @async
 * @method
 * @name StateRepository#fetchIdentityIdsByPublicKeyHashes
 * @param {string[]} publicKeyHashes
 * @returns {Promise<Object.<string, string>>}
 */

/**
 * Fetch latest platform block header
 *
 * @async
 * @method
 * @name fetchLatestPlatformBlockHeader
 * @returns {Promise<abci.IHeader>}
 */
