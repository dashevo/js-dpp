const { InstantLock } = require('@dashevo/dashcore-lib');

class InstantAssetLockProof {
  constructor(rawAssetLockProof) {
    this.instantLock = InstantLock.fromBuffer(rawAssetLockProof.instantLock);
  }

  /**
   * Get proof type
   *
   * @returns {number}
   */
  getType() {
    return 0;
  }

  /**
   * @returns {InstantLock}
   */
  getInstantLock() {
    return this.instantLock;
  }

  /**
   * @returns {RawInstantAssetLockProof}
   */
  toObject() {
    return {
      type: this.getType(),
      instantLock: this.getInstantLock().toBuffer(),
    };
  }

  /**
   * @returns {JsonInstantAssetLockProof}
   */
  toJSON() {
    return {
      type: this.getType(),
      instantLock: this.getInstantLock().toBuffer().toString('base64'),
    };
  }
}

/**
 * @typedef {Object} RawInstantAssetLockProof
 * @property {number} type
 * @property {Buffer} instantLock
 */

/**
 * @typedef {Object} JsonInstantAssetLockProof
 * @property {number} type
 * @property {string} instantLock
 */

module.exports = InstantAssetLockProof;
