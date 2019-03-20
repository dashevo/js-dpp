const ValidationResult = require('../../validation/ValidationResult');

const ContractAlreadyPresentError = require('../../errors/ContractAlreadyPresentError');

/**
 * @typedef verifyContract
 * @param {STPacket} stPacket
 * @param {Contract} dpContract
 * @return {ValidationResult}
 */
async function verifyContract(stPacket, dpContract) {
  const result = new ValidationResult();

  if (dpContract) {
    result.addError(
      new ContractAlreadyPresentError(stPacket.getContract()),
    );
  }

  return result;
}

module.exports = verifyContract;
