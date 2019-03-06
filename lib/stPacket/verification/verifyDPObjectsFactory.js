const bs58 = require('bs58');

const DPObject = require('../../object/DPObject');

const ValidationResult = require('../../validation/ValidationResult');

const InvalidDPObjectActionError = require('../errors/InvalidDPObjectActionError');

const DPObjectAlreadyPresentError = require('../../errors/DPObjectAlreadyPresentError');
const DPObjectNotFoundError = require('../../errors/DPObjectNotFoundError');
const InvalidDPObjectRevisionError = require('../../errors/InvalidDPObjectRevisionError');
const InvalidDPObjectScopeError = require('../../errors/InvalidDPObjectScopeError');
const DuplicateDPObjectError = require('../../errors/DuplicateDPObjectError');

const hash = require('../../util/hash');

/**
 * @param {fetchDPObjectsByObjects} fetchDPObjectsByObjects
 * @param {DataProvider} dataProvider
 * @return {verifyDPObjects}
 */
function verifyDPObjectsFactory(fetchDPObjectsByObjects, dataProvider) {
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
      stPacket.getDPObjects(),
    );

    stPacket.getDPObjects()
      .forEach((dpObject) => {
        const fetchedDPObject = fetchedDPObjects.find(o => dpObject.getId() === o.getId());

        const stPacketScope = hash(stPacket.getDPContractId() + userId);
        if (dpObject.scope !== stPacketScope) {
          result.addError(
            new InvalidDPObjectScopeError(dpObject),
          );
        }

        switch (dpObject.getAction()) {
          case DPObject.ACTIONS.CREATE:
            if (fetchedDPObject) {
              result.addError(
                new DPObjectAlreadyPresentError(dpObject, fetchedDPObject),
              );
            }
            break;
          case DPObject.ACTIONS.UPDATE:
          case DPObject.ACTIONS.DELETE:
            if (!fetchedDPObject) {
              result.addError(
                new DPObjectNotFoundError(dpObject),
              );

              break;
            }

            if (dpObject.getRevision() !== fetchedDPObject.getRevision() + 1) {
              result.addError(
                new InvalidDPObjectRevisionError(dpObject, fetchedDPObject),
              );
            }

            break;
          default:
            throw new InvalidDPObjectActionError(dpObject);
        }
      });

    // Verify objects uniqueness

    // 1. Prepare fetchDPObjects queries from indexed properties
    const dpObjectIndexQueries = stPacket.getDPObjects()
      .reduce((queries, dpObject) => {
        const dpObjectSchema = dpContract.getDPObjectSchema(dpObject.getType());

        if (!dpObjectSchema.indices) {
          return queries;
        }

        dpObjectSchema.indices
          .filter(index => index.unique)
          .forEach((indexDefinition) => {
            const where = Object.keys(indexDefinition.properties)
              .reduce((obj, propertyName) => {
                // eslint-disable-next-line no-param-reassign
                obj[`dpObject.${propertyName}`] = dpObject.get(propertyName);

                return obj;
              }, {});

            // Exclude origin DP Object
            const idBuffer = Buffer.from(dpObject.getId(), 'hex');
            // eslint-disable-next-line no-underscore-dangle
            where._id = { $ne: bs58.encode(idBuffer) };

            queries.push({
              type: dpObject.getType(),
              indexDefinition,
              originDPObject: dpObject,
              where,
            });
          });

        return queries;
      }, []);

    // 2. Fetch DP Object by indexed properties
    const fetchDPObjectPromises = dpObjectIndexQueries
      .map(({
        type,
        where,
        indexDefinition,
        originDPObject,
      }) => (
        dataProvider.fetchDPObjects(
          stPacket.getDPContractId(),
          type,
          { where },
        )
          .then(dpObjects => Object.assign(dpObjects, {
            indexDefinition,
            originDPObject,
          }))
      ));

    const fetchedDPObjectsByIndices = await Promise.all(fetchDPObjectPromises);

    // 3. Create errors if duplicates found
    fetchedDPObjectsByIndices
      .filter(dpObjects => dpObjects.length !== 0)
      .forEach((dpObjects) => {
        result.addError(
          new DuplicateDPObjectError(
            dpObjects.originDPObject,
            dpObjects.indexDefinition,
          ),
        );
      });

    return result;
  }

  return verifyDPObjects;
}

module.exports = verifyDPObjectsFactory;
