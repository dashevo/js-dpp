const InstantAssetLockProof = require('./proof/instant/InstantAssetLockProof');
const ChainAssetLockProof = require('./proof/chain/ChainAssetLockProof');

class AssetLock {
  /**
   * @param {RawAssetLock} rawAssetLock
   */
  constructor(rawAssetLock) {
    this.proof = new AssetLock.PROOF_CLASSES_BY_TYPES[rawAssetLock.proof.type](rawAssetLock.proof);
  }

  /**
   * Get proof
   *
   * @returns {InstantAssetLockProof}
   */
  getProof() {
    return this.proof;
  }

  /**
   * Create identifier
   *
   * @returns {Identifier}
   */
  createIdentifier() {
    return this.proof.createIdentifier();
  }

  /**
   *
   * @returns {RawAssetLock}
   */
  toObject() {
    return {
      proof: this.getProof().toObject(),
    };
  }

  /**
   * @returns {JsonAssetLock}
   */
  toJSON() {
    return {
      ...this.toObject(),
      proof: this.getProof().toJSON(),
    };
  }
}

/**
 * @typedef {Object} RawAssetLock
 * @property {RawInstantAssetLockProof} proof
 */

/**
 * @typedef {Object} JsonAssetLock
 * @property {number} outputIndex
 * @property {JsonInstantAssetLockProof} proof
 */

AssetLock.PROOF_TYPE_INSTANT = 0;
AssetLock.PROOF_TYPE_CHAIN = 1;

AssetLock.PROOF_CLASSES_BY_TYPES = {
  [AssetLock.PROOF_TYPE_INSTANT]: InstantAssetLockProof,
  [AssetLock.PROOF_TYPE_CHAIN]: ChainAssetLockProof,
};

module.exports = AssetLock;
