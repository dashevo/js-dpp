const Identifier = require('../../../../../identifier/Identifier');
const hash = require('../../../../../util/hash');

class ChainAssetLockProof {
  /**
   * @param {RawChainAssetLockProof} rawAssetLockProof
   */
  constructor(rawAssetLockProof) {
    this.height = rawAssetLockProof.height;
    this.outPoint = rawAssetLockProof.outPoint;
  }

  /**
   * Get proof type
   *
   * @returns {number}
   */
  getType() {
    return ChainAssetLockProof.type;
  }

  /**
   * Get height
   *
   * @returns {number}
   */
  getHeight() {
    return this.height;
  }

  /**
   * Get outPoint
   *
   * @return {Buffer}
   */
  getOutPoint() {
    return this.outPoint;
  }

  /**
   * Create identifier
   *
   * @returns {Identifier}
   */
  createIdentifier() {
    return new Identifier(
      hash(this.getOutPoint()),
    );
  }

  /**
   * Get plain object representation
   *
   * @returns {RawChainAssetLockProof}
   */
  toObject() {
    return {
      type: this.getType(),
      height: this.getHeight(),
      outPoint: this.getOutPoint(),
    };
  }

  /**
   * Get JSON representation
   *
   * @returns {JsonChainAssetLockProof}
   */
  toJSON() {
    return {
      type: this.getType(),
      height: this.getHeight(),
      outPoint: this.getOutPoint().toString('hex'),
    };
  }
}

/**
 * @typedef {Object} RawChainAssetLockProof
 * @property {number} type
 * @property {number} height
 * @property {Buffer} outPoint
 */

/**
 * @typedef {Object} JsonChainAssetLockProof
 * @property {number} type
 * @property {number} height
 * @property {string} outPoint
 */

ChainAssetLockProof.type = 1;

module.exports = ChainAssetLockProof;
