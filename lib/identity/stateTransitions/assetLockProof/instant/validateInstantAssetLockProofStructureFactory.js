const { InstantLock } = require('@dashevo/dashcore-lib');

const instantAssetLockProofSchema = require('../../../../../schema/identity/stateTransition/assetLockProof/instantAssetLockProof.json');

const convertBuffersToArrays = require('../../../../util/convertBuffersToArrays');
const InvalidIdentityAssetLockProofError = require('../../../../errors/InvalidIdentityAssetLockProofError');
const IdentityAssetLockProofMismatchError = require('../../../../errors/IdentityAssetLockProofMismatchError');
const InvalidIdentityAssetLockProofSignatureError = require('../../../../errors/InvalidIdentityAssetLockProofSignatureError');
const IdentityAssetLockTransactionOutPointAlreadyExistsError = require('../../../../errors/IdentityAssetLockTransactionOutPointAlreadyExistsError');

/**
 * @param {JsonSchemaValidator} jsonSchemaValidator
 * @param {StateRepository} stateRepository
 * @param {validateAssetLockTransaction} validateAssetLockTransaction
 * @returns {validateInstantAssetLockProofStructure}
 */
function validateInstantAssetLockProofStructureFactory(
  jsonSchemaValidator,
  stateRepository,
  validateAssetLockTransaction,
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

    const validateAssetLockTransactionResult = await validateAssetLockTransaction(
      rawAssetLockProof.transaction,
      rawAssetLockProof.outputIndex,
    );

    result.merge(validateAssetLockTransactionResult);

    if (!result.isValid()) {
      return result;
    }

    const { publicKeyHash, transaction } = validateAssetLockTransactionResult.getData();

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
    const outPointIsUsed = await stateRepository.isAssetLockTransactionOutPointAlreadyUsed(
      outPointBuffer,
    );

    if (!outPointIsUsed) {
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
