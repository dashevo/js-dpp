const ValidationResult = require('../../validation/ValidationResult');

const DataContractAlreadyPresentError = require('../../errors/DataContractAlreadyPresentError');

/**
 * @typedef validateDataContractSTDataFactory
 * @param {STPacket} stPacket
 * @param {DataContract} contract
 * @return {ValidationResult}
 */
async function validateDataContractSTDataFactory(stPacket, contract) {
  const result = new ValidationResult();

  if (contract) {
    result.addError(
      new DataContractAlreadyPresentError(stPacket.getContract()),
    );
  }

  return result;
}

module.exports = validateDataContractSTDataFactory;
