const ValidationResult = require('../../../validation/ValidationResult');
const InvalidIdentityLockTransactionError = require('../../../errors/InvalidIdentityLockTransactionError');

/**
 * @typedef ValidateLockTransaction
 * @param {Transaction} transaction
 * @param {number} outputIndex
 * @returns {ValidationResult}
 */
function validateLockTransaction(transaction, outputIndex) {
  const result = new ValidationResult();

  if (!transaction.outputs[outputIndex]) {
    result.addError(new InvalidIdentityLockTransactionError(transaction));
  }

  if (!result.isValid()) {
    return result;
  }

  const { script } = transaction.outputs[outputIndex];
  const publicKeyHash = script.getData();

  if (!script.isDataOut() || publicKeyHash.length !== 20) {
    result.addError(new InvalidIdentityLockTransactionError(transaction));
  }

  return result;
}

module.exports = validateLockTransaction;
