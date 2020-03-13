const ValidationResult = require('../../../validation/ValidationResult');
const InvalidIdentityLockTransaction = require('../../../errors/InvalidIdentityLockTransaction');

/**
 * @typedef ValidateLockTransaction
 * @param {Transaction} transaction
 * @param {number} outputIndex
 * @returns {ValidationResult}
 */
function validateLockTransaction(transaction, outputIndex) {
  const result = new ValidationResult();

  if (!transaction.outputs[outputIndex]) {
    result.addError(new InvalidIdentityLockTransaction(transaction));
  }

  if (!result.isValid()) {
    return result;
  }

  const { script } = transaction.outputs[outputIndex];
  const publicKeyHash = script.getData();

  if (!script.isDataOut() || publicKeyHash.length !== 20) {
    result.addError(new InvalidIdentityLockTransaction(transaction));
  }

  return result;
}

module.exports = validateLockTransaction;
