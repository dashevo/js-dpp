const { InstantLock, Transaction } = require('@dashevo/dashcore-lib');

const instantAssetLockProofSchema = require('../../../../../../schema/identity/stateTransition/assetLock/proof/instantAssetLockProof.json');

const convertBuffersToArrays = require('../../../../../util/convertBuffersToArrays');
const InvalidIdentityAssetLockProofError = require('../../../../../errors/InvalidIdentityAssetLockProofError');
const IdentityAssetLockProofMismatchError = require('../../../../../errors/IdentityAssetLockProofMismatchError');
const InvalidIdentityAssetLockProofSignatureError = require('../../../../../errors/InvalidIdentityAssetLockProofSignatureError');
const IdentityAssetLockTransactionOutputNotFoundError = require('../../../../../errors/IdentityAssetLockTransactionOutputNotFoundError');
const IdentityAssetLockTransactionOutPointAlreadyExistsError = require('../../../../../errors/IdentityAssetLockTransactionOutPointAlreadyExistsError');
const InvalidIdentityAssetLockTransactionError = require('../../../../../errors/InvalidIdentityAssetLockTransactionError');

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

    /**
     * @type {Transaction}
     */
    let transaction;
    try {
      transaction = new Transaction(rawAssetLockProof.transaction);
    } catch (e) {
      const error = new InvalidIdentityAssetLockTransactionError(e.message);

      result.addError(error);

      return result;
    }

    if (!transaction.outputs[rawAssetLockProof.outputIndex]) {
      result.addError(
        new IdentityAssetLockTransactionOutputNotFoundError(rawAssetLockProof.outputIndex),
      );

      return result;
    }

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
    const outPointIsUsed = await stateRepository.checkAssetLockTransactionOutPointAlreadyUsed(
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
    }

    return result;
  }

  return validateInstantAssetLockProofStructure;
}

module.exports = validateInstantAssetLockProofStructureFactory;
