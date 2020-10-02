const AbstractDocumentTransition = require('./AbstractDocumentTransition');
const EncodedBuffer = require('../../../util/encoding/EncodedBuffer');

class DocumentDeleteTransition extends AbstractDocumentTransition {
  /**
   * @param {RawDocumentDeleteTransition} rawTransition
   * @param {DataContract} dataContract
   */
  constructor(rawTransition, dataContract) {
    super(rawTransition, dataContract);

    this.id = EncodedBuffer.from(rawTransition.$id, EncodedBuffer.ENCODING.BASE58);
    this.type = rawTransition.$type;
  }

  /**
   * Get action
   *
   * @returns {number}
   */
  getAction() {
    return AbstractDocumentTransition.ACTIONS.DELETE;
  }

  /**
   * Get id
   *
   * @returns {EncodedBuffer}
   */
  getId() {
    return this.id;
  }

  /**
   * Get type
   *
   * @returns {*}
   */
  getType() {
    return this.type;
  }

  /**
   * Get plain object representation
   *
   * @param {Object} [options]
   * @param {boolean} [options.encodedBuffer=false]
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

    let rawDocumentTransition = {
      ...super.toObject(options),
      $id: this.getId(),
      $type: this.getType(),
    };

    if (!options.encodedBuffer) {
      rawDocumentTransition = {
        ...rawDocumentTransition,
        $id: rawDocumentTransition.$id.toString(),
      };
    }

    return rawDocumentTransition;
  }

  /**
   * Create document transition from JSON
   *
   * @param {RawDocumentDeleteTransition} rawDocumentTransition
   * @param {DataContract} dataContract
   *
   * @return {DocumentDeleteTransition}
   */
  static fromJSON(rawDocumentTransition, dataContract) {
    const plainObjectDocumentTransition = AbstractDocumentTransition.translateJsonToObject(
      rawDocumentTransition, dataContract,
    );

    return new DocumentDeleteTransition(plainObjectDocumentTransition, dataContract);
  }
}

/**
 * @typedef {Object} RawDocumentDeleteTransition
 * @property {number} $action
 * @property {string} $id
 * @property {string} $type
 */

DocumentDeleteTransition.ENCODED_PROPERTIES = {
  ...AbstractDocumentTransition.ENCODED_PROPERTIES,
  $id: {
    contentEncoding: 'base58',
  },
};

module.exports = DocumentDeleteTransition;
