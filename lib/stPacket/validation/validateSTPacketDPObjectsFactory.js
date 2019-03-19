const ValidationResult = require('../../validation/ValidationResult');

const DuplicateDocumentsError = require('../../errors/DuplicateDocumentsError');
const InvalidDPContractError = require('../../errors/InvalidDPContractError');

/**
 * @param {validateDocument} validateDocument
 * @param {findDuplicatedDPObjects} findDuplicatedDPObjects
 * @param {findDuplicateDPObjectsByIndices} findDuplicateDPObjectsByIndices
 * @return {validateSTPacketDPObjects}
 */
function validateSTPacketDPObjectsFactory(
  validateDocument,
  findDuplicatedDPObjects,
  findDuplicateDPObjectsByIndices,
) {
  /**
   * @typedef validateSTPacketDPObjects
   * @param {Object} rawSTPacket
   * @param {DPContract} dpContract
   * @return {ValidationResult}
   */
  function validateSTPacketDPObjects(rawSTPacket, dpContract) {
    const { documents: rawDocuments } = rawSTPacket;

    const result = new ValidationResult();

    if (dpContract.getId() !== rawSTPacket.contractId) {
      result.addError(
        new InvalidDPContractError(dpContract, rawSTPacket),
      );
    }

    const duplicatedDPObjects = findDuplicatedDPObjects(rawDocuments);
    if (duplicatedDPObjects.length) {
      result.addError(
        new DuplicateDocumentsError(duplicatedDPObjects),
      );
    }

    const duplicateDPObjectsByIndices = findDuplicateDPObjectsByIndices(
      rawDocuments,
      dpContract,
    );
    if (duplicateDPObjectsByIndices.length > 0) {
      result.addError(
        new DuplicateDocumentsError(duplicateDPObjectsByIndices),
      );
    }

    rawDocuments.forEach((rawDocument) => {
      result.merge(
        validateDocument(rawDocument, dpContract),
      );
    });

    return result;
  }

  return validateSTPacketDPObjects;
}

module.exports = validateSTPacketDPObjectsFactory;
