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
      new ContractAlreadyPresentError(stPacket.getDPContract()),
    );
  }

  return result;
}

module.exports = verifyContract;
