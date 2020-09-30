const AbstractDocumentTransition = require('./AbstractDocumentTransition');

const transpileEncodedProperties = require('../../../util/encoding/transpileEncodedProperties');
const EncodedBuffer = require('../../../util/encoding/EncodedBuffer');

class DocumentCreateTransition extends AbstractDocumentTransition {
  /**
   * @param {RawDocumentCreateTransition} rawTransition
   * @param {DataContract} dataContract
   */
  constructor(rawTransition, dataContract) {
    super(rawTransition, dataContract);

    const data = { ...rawTransition };

    this.id = EncodedBuffer.from(rawTransition.$id, EncodedBuffer.ENCODING.BASE58);
    this.type = rawTransition.$type;
    this.entropy = EncodedBuffer.from(rawTransition.$entropy, EncodedBuffer.ENCODING.BASE58);

    if (rawTransition.$createdAt) {
      this.createdAt = new Date(rawTransition.$createdAt);
    }

    if (rawTransition.$updatedAt) {
      this.updatedAt = new Date(rawTransition.$updatedAt);
    }

    delete data.$id;
    delete data.$type;
    delete data.$entropy;
    delete data.$action;
    delete data.$dataContractId;
    delete data.$createdAt;
    delete data.$updatedAt;

    this.data = transpileEncodedProperties(
      dataContract,
      this.getType(),
      data,
      (buffer, encoding) => new EncodedBuffer(buffer, encoding),
    );
  }

  /**
   * Get action
   *
   * @returns {number}
   */
  getAction() {
    return AbstractDocumentTransition.ACTIONS.CREATE;
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
   * @returns {string}
   */
  getType() {
    return this.type;
  }

  /**
   * Get entropy
   *
   * @returns {EncodedBuffer}
   */
  getEntropy() {
    return this.entropy;
  }

  /**
   * Get data
   *
   * @returns {Object}
   */
  getData() {
    return this.data;
  }

  /**
   * Get creation date
   *
   * @return {Date}
   */
  getCreatedAt() {
    return this.createdAt;
  }

  /**
   * Get update date
   *
   * @return {Date}
   */
  getUpdatedAt() {
    return this.updatedAt;
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
      $entropy: this.getEntropy(),
      ...this.getData(),
    };

    if (this.createdAt) {
      rawDocumentTransition.$createdAt = this.getCreatedAt().getTime();
    }

    if (this.updatedAt) {
      rawDocumentTransition.$updatedAt = this.getUpdatedAt().getTime();
    }

    if (!options.encodedBuffer) {
      rawDocumentTransition = {
        ...rawDocumentTransition,
        $id: rawDocumentTransition.$id.toBuffer(),
        $entropy: rawDocumentTransition.$entropy.toBuffer(),
      };

      return transpileEncodedProperties(
        this.dataContract,
        this.getType(),
        rawDocumentTransition,
        (encodedBuffer) => encodedBuffer.toBuffer(),
      );
    }

    return rawDocumentTransition;
  }

  /**
   * Get JSON representation
   *
   * @return {Object}
   */
  toJSON() {
    let data = super.toJSON();

    data = {
      ...super.toJSON(),
      $id: data.$id.toString(),
      $entropy: data.$entropy.toString(),
    };

    return transpileEncodedProperties(
      this.dataContract,
      this.getType(),
      data,
      (encodedBuffer) => encodedBuffer.toString(),
    );
  }

  /**
   * Create document transition from JSON
   *
   * @param {RawDocumentCreateTransition} rawDocumentTransition
   * @param {DataContract} dataContract
   *
   * @return {DocumentCreateTransition}
   */
  static fromJSON(rawDocumentTransition, dataContract) {
    const plainObjectDocumentTransition = AbstractDocumentTransition.translateJsonToObject(
      rawDocumentTransition, dataContract,
    );

    return new DocumentCreateTransition(plainObjectDocumentTransition, dataContract);
  }
}

/**
 * @typedef {Object} RawDocumentCreateTransition
 * @property {number} $action
 * @property {Buffer} $id
 * @property {string} $type
 * @property {Buffer} $entropy
 * @property {number} [$createdAt]
 * @property {number} [$updatedAt]
 */

DocumentCreateTransition.INITIAL_REVISION = 1;

module.exports = DocumentCreateTransition;
