const InstantAssetLockProof = require('./instant/InstantAssetLockProof');
const ChainAssetLockProof = require('./chain/ChainAssetLockProof');
const UnknownAssetLockProofError = require('../../../errors/UnknownAssetLockProofError');

/**
 *
 * @param {RawInstantAssetLockProof|RawChainAssetLockProof} rawAssetLockProof
 * @returns {InstantAssetLockProof|ChainAssetLockProof}
 */
function createAssetLockProofInstance(rawAssetLockProof) {
  if (rawAssetLockProof.type === InstantAssetLockProof.type) {
    return new InstantAssetLockProof(rawAssetLockProof);
  }

  if (rawAssetLockProof.type === ChainAssetLockProof.type) {
    return new ChainAssetLockProof(rawAssetLockProof);
  }

  throw new UnknownAssetLockProofError(rawAssetLockProof.type);
}

module.exports = createAssetLockProofInstance;
