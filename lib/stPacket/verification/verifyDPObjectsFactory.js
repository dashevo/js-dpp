const Document = require('../../document/Document');

const ValidationResult = require('../../validation/ValidationResult');

const InvalidDPObjectActionError = require('../errors/InvalidDPObjectActionError');

const DPObjectAlreadyPresentError = require('../../errors/DPObjectAlreadyPresentError');
const DPObjectNotFoundError = require('../../errors/DPObjectNotFoundError');
const InvalidDPObjectRevisionError = require('../../errors/InvalidDPObjectRevisionError');
const InvalidDPObjectScopeError = require('../../errors/InvalidDPObjectScopeError');

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
            new InvalidDPObjectScopeError(document),
          );
        }

        switch (document.getAction()) {
          case Document.ACTIONS.CREATE:
            if (fetchedDPObject) {
              result.addError(
                new DPObjectAlreadyPresentError(document, fetchedDPObject),
              );
            }
            break;
          case Document.ACTIONS.UPDATE:
          case Document.ACTIONS.DELETE:
            if (!fetchedDPObject) {
              result.addError(
                new DPObjectNotFoundError(document),
              );

              break;
            }

            if (document.getRevision() !== fetchedDPObject.getRevision() + 1) {
              result.addError(
                new InvalidDPObjectRevisionError(document, fetchedDPObject),
              );
            }

            break;
          default:
            throw new InvalidDPObjectActionError(document);
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
