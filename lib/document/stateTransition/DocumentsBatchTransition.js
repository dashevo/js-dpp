const AbstractStateTransitionIdentitySigned = require('../../stateTransition/AbstractStateTransitionIdentitySigned');
const stateTransitionTypes = require('../../stateTransition/stateTransitionTypes');

const AbstractDocumentTransition = require('./documentTransition/AbstractDocumentTransition');
const DocumentCreateTransition = require('./documentTransition/DocumentCreateTransition');
const DocumentReplaceTransition = require('./documentTransition/DocumentReplaceTransition');
const DocumentDeleteTransition = require('./documentTransition/DocumentDeleteTransition');

const actionsToClasses = {
  [AbstractDocumentTransition.ACTIONS.CREATE]: DocumentCreateTransition,
  [AbstractDocumentTransition.ACTIONS.REPLACE]: DocumentReplaceTransition,
  [AbstractDocumentTransition.ACTIONS.DELETE]: DocumentDeleteTransition,
};

const EncodedBuffer = require('../../util/encoding/EncodedBuffer');

class DocumentsBatchTransition extends AbstractStateTransitionIdentitySigned {
  /**
   * @param {RawDocumentsBatchTransition} [rawStateTransition]
   * @param {DataContract[]} dataContracts
   */
  constructor(rawStateTransition = {}, dataContracts) {
    super(rawStateTransition);

    this.ownerId = EncodedBuffer.from(rawStateTransition.ownerId, EncodedBuffer.ENCODING.BASE58);

    const dataContractsMap = dataContracts.reduce((map, dataContract) => ({
      ...map,
      [dataContract.getId().toString()]: dataContract,
    }), {});

    this.transitions = (rawStateTransition.transitions || []).map((rawDocumentTransition) => (
      new actionsToClasses[rawDocumentTransition.$action](
        rawDocumentTransition,
        dataContractsMap[
          EncodedBuffer
            .from(rawDocumentTransition.$dataContractId, EncodedBuffer.ENCODING.BASE58)
            .toString()],
      )
    ));
  }

  /**
   * Get State Transition type
   *
   * @return {number}
   */
  getType() {
    return stateTransitionTypes.DOCUMENTS_BATCH;
  }

  /**
   * Get owner id
   *
   * @return {EncodedBuffer}
   */
  getOwnerId() {
    return this.ownerId;
  }

  /**
   * Get document action transitions
   *
   * @return {DocumentCreateTransition[]|DocumentReplaceTransition[]|DocumentDeleteTransition[]}
   */
  getTransitions() {
    return this.transitions;
  }

  /**
   * Get state transition as plain object
   *
   * @param {Object} [options]
   * @param {boolean} [options.skipSignature]
   * @param {boolean} [options.encodedBuffer=false]
   *
   * @return {Object}
   */
  toObject(options = {}) {
    Object.assign(
      options,
      {
        encodedBuffer: false,
        ...options,
      },
    );

    let rawDocumentsBatchTransition = {
      ...super.toObject(options),
      ownerId: this.getOwnerId(),
      transitions: this.getTransitions().map((t) => t.toObject()),
    };

    if (!options.encodedBuffer) {
      rawDocumentsBatchTransition = {
        ...rawDocumentsBatchTransition,
        ownerId: rawDocumentsBatchTransition.ownerId.toBuffer(),
      };
    }

    return rawDocumentsBatchTransition;
  }

  /**
   * Get state transition as JSON
   *
   * @param {Object} [options]
   * @param {boolean} [options.skipSignature]
   *
   * @return {Object}
   */
  toJSON(options = {}) {
    let json = super.toJSON(options);

    json = {
      ...json,
      ownerId: json.ownerId.toString(),
    };

    // overwrite plain object transitions
    json.transitions = this.getTransitions().map((t) => t.toJSON());

    return json;
  }

  /**
   * Create state transition from JSON
   *
   * @param {RawDocumentsBatchTransition} rawStateTransition
   * @param {DataContract[]} dataContracts
   *
   * @return {DocumentsBatchTransition}
   */
  static fromJSON(rawStateTransition, dataContracts) {
    const plainObject = AbstractStateTransitionIdentitySigned
      .translateJsonToObject(rawStateTransition);

    const dataContractsMap = dataContracts.reduce((map, dataContract) => (
      {
        ...map,
        [dataContract.getId()]: dataContract,
      }
    ), {});

    plainObject.transitions = plainObject.transitions
      .map((jsonTransition) => (
        actionsToClasses[jsonTransition.$action]
          .fromJSON(jsonTransition, dataContractsMap[jsonTransition.$dataContractId])
          .toObject()
      ));

    return new DocumentsBatchTransition(
      plainObject,
      dataContracts,
    );
  }
}

/**
 * @typedef {Object} RawDocumentsBatchTransition
 * @property {number} protocolVersion
 * @property {number} type
 * @property {Buffer} ownerId
 * @property {
 *   Array.<RawDocumentCreateTransition|RawDocumentReplaceTransition|RawDocumentDeleteTransition>
 * } transitions
 * @property {number|null} signaturePublicKeyId
 * @property {Buffer|null} signature
 */

DocumentsBatchTransition.ENCODED_PROPERTIES = {
  ...AbstractStateTransitionIdentitySigned.ENCODED_PROPERTIES,
  ownerId: {
    contentEncoding: 'base58',
  },
};

module.exports = DocumentsBatchTransition;
