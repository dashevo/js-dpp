const { Transaction } = require('@dashevo/dashcore-lib');

const InvalidIdentityAssetLockTransactionError = require('../../../errors/InvalidIdentityAssetLockTransactionError');
const IdentityAssetLockTransactionOutputNotFoundError = require('../../../errors/IdentityAssetLockTransactionOutputNotFoundError');
const InvalidIdentityAssetLockTransactionOutputError = require('../../../errors/InvalidIdentityAssetLockTransactionOutputError');
const ValidationResult = require('../../../validation/ValidationResult');

/**
 *
 * @param {Object} rawTransaction
 * @param {number} outputIndex
 * @returns {Promise<ValidationResult>}
 */

async function validateAssetLockTransaction(rawTransaction, outputIndex) {
  const result = new ValidationResult();
  /**
   * @type {Transaction}
   */
  let transaction;
  try {
    transaction = new Transaction(rawTransaction);
  } catch (e) {
    const error = new InvalidIdentityAssetLockTransactionError(e.message);

    result.addError(error);

    return result;
  }

  if (!transaction.outputs[outputIndex]) {
    result.addError(
      new IdentityAssetLockTransactionOutputNotFoundError(outputIndex),
    );

    return result;
  }

  const output = transaction.outputs[outputIndex];

  if (!output.script.isDataOut()) {
    result.addError(
      new InvalidIdentityAssetLockTransactionOutputError('Output is not a valid standard OP_RETURN output', output),
    );

    return result;
  }

  const publicKeyHash = transaction.outputs[outputIndex].script.getData();

  if (publicKeyHash.length !== 20) {
    result.addError(
      new InvalidIdentityAssetLockTransactionOutputError('Output has invalid public key hash', output),
    );

    return result;
  }

  result.setData({
    publicKeyHash,
    transaction,
  });

  return result;
}

module.exports = validateAssetLockTransaction;
