const { InstantLock } = require('@dashevo/dashcore-lib');

const instantAssetLockProofSchema = require('../../../../../schema/identity/stateTransition/assetLockProof/instantAssetLockProof.json');

const convertBuffersToArrays = require('../../../../util/convertBuffersToArrays');
const InvalidIdentityAssetLockProofError = require('../../../../errors/InvalidIdentityAssetLockProofError');
const IdentityAssetLockProofMismatchError = require('../../../../errors/IdentityAssetLockProofMismatchError');
const InvalidIdentityAssetLockProofSignatureError = require('../../../../errors/InvalidIdentityAssetLockProofSignatureError');
const IdentityAssetLockTransactionOutPointAlreadyExistsError = require('../../../../errors/IdentityAssetLockTransactionOutPointAlreadyExistsError');
const validateAssetLockTransaction = require('../validateAssetLockTransaction');

/**
 * @param {JsonSchemaValidator} jsonSchemaValidator
 * @param {StateRepository} stateRepository
 * @returns {validateInstantAssetLockProofStructure}
 */
function validateInstantAssetLockProofStructureFactory(
  jsonSchemaValidator,
  stateRepository,
) {
  /**
   * @typedef {validateInstantAssetLockProofStructure}
   * @param {RawInstantAssetLockProof} rawAssetLockProof
   */
  async function validateInstantAssetLockProofStructure(
    rawAssetLockProof,
  ) {
    const result = jsonSchemaValidator.validate(
      instantAssetLockProofSchema,
      convertBuffersToArrays(rawAssetLockProof),
    );

    if (!result.isValid()) {
      return result;
    }

    const isAssetLockTransactionValid = await validateAssetLockTransaction(
      rawAssetLockProof.transaction,
      rawAssetLockProof.outputIndex,
    );

    result.merge(isAssetLockTransactionValid);

    if (!result.isValid()) {
      return result;
    }

    const { publicKeyHash, transaction } = isAssetLockTransactionValid.getData();

    let instantLock;
    try {
      instantLock = InstantLock.fromBuffer(rawAssetLockProof.instantLock);
    } catch (e) {
      const error = new InvalidIdentityAssetLockProofError(e.message);

      result.addError(error);

      return result;
    }

    if (instantLock.txid !== transaction.id) {
      result.addError(new IdentityAssetLockProofMismatchError());

      return result;
    }

    const outPointBuffer = transaction.getOutPointBuffer(rawAssetLockProof.outputIndex);
    const outPointIsNotUsed = await stateRepository.isAssetLockTransactionOutPointAlreadyUsed(
      outPointBuffer,
    );

    if (!outPointIsNotUsed) {
      result.addError(
        new IdentityAssetLockTransactionOutPointAlreadyExistsError(outPointBuffer),
      );

      return result;
    }

    if (!await stateRepository.verifyInstantLock(instantLock)) {
      result.addError(new InvalidIdentityAssetLockProofSignatureError());

      return result;
    }

    result.setData(publicKeyHash);

    return result;
  }

  return validateInstantAssetLockProofStructure;
}

module.exports = validateInstantAssetLockProofStructureFactory;
