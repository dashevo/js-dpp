const ValidationResult = require('../../validation/ValidationResult');

const DPContractAlreadyPresentError = require('../../errors/DPContractAlreadyPresentError');

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
      new DPContractAlreadyPresentError(stPacket.getDPContract()),
    );
  }

  return result;
}

module.exports = verifyContract;
