const Document = require('../../document/Document');

const ValidationResult = require('../../validation/ValidationResult');

const InvalidDocumentActionError = require('../errors/InvalidDocumentActionError');

const DocumentAlreadyPresentError = require('../../errors/DocumentAlreadyPresentError');
const DocumentNotFoundError = require('../../errors/DocumentNotFoundError');
const InvalidDocumentRevisionError = require('../../errors/InvalidDocumentRevisionError');
const InvalidDocumentScopeError = require('../../errors/InvalidDocumentScopeError');

const hash = require('../../util/hash');

/**
 * @param {fetchDPObjectsByObjects} fetchDPObjectsByObjects
 * @param {verifyDPObjectsUniquenessByIndices} verifyDPObjectsUniquenessByIndices
 * @return {verifyDPObjects}
 */
function verifyDPObjectsFactory(fetchDPObjectsByObjects, verifyDPObjectsUniquenessByIndices) {
  /**
   * @typedef verifyDPObjects
   * @param {STPacket} stPacket
   * @param {string} userId
   * @param {DPContract} dpContract
   * @return {ValidationResult}
   */
  async function verifyDPObjects(stPacket, userId, dpContract) {
    const result = new ValidationResult();

    const fetchedDPObjects = await fetchDPObjectsByObjects(
      stPacket.getDPContractId(),
      stPacket.getDocuments(),
    );

    stPacket.getDocuments()
      .forEach((document) => {
        const fetchedDPObject = fetchedDPObjects.find(o => document.getId() === o.getId());

        const stPacketScope = hash(stPacket.getDPContractId() + userId);
        if (document.scope !== stPacketScope) {
          result.addError(
            new InvalidDocumentScopeError(document),
          );
        }

        switch (document.getAction()) {
          case Document.ACTIONS.CREATE:
            if (fetchedDPObject) {
              result.addError(
                new DocumentAlreadyPresentError(document, fetchedDPObject),
              );
            }
            break;
          case Document.ACTIONS.UPDATE:
          case Document.ACTIONS.DELETE:
            if (!fetchedDPObject) {
              result.addError(
                new DocumentNotFoundError(document),
              );

              break;
            }

            if (document.getRevision() !== fetchedDPObject.getRevision() + 1) {
              result.addError(
                new InvalidDocumentRevisionError(document, fetchedDPObject),
              );
            }

            break;
          default:
            throw new InvalidDocumentActionError(document);
        }
      });

    result.merge(
      await verifyDPObjectsUniquenessByIndices(stPacket, userId, dpContract),
    );

    return result;
  }

  return verifyDPObjects;
}

module.exports = verifyDPObjectsFactory;
