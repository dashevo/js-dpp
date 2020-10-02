const hash = require('../util/hash');
const { encode } = require('../util/serializer');

const getEncodedPropertiesFromSchema = require('./getEncodedPropertiesFromSchema');

const InvalidDocumentTypeError = require('../errors/InvalidDocumentTypeError');
const EncodedBuffer = require('../util/encoding/EncodedBuffer');

class DataContract {
  /**
   * @param {RawDataContract} rawDataContract
   */
  constructor(rawDataContract) {
    this.protocolVersion = rawDataContract.protocolVersion;

    this.id = EncodedBuffer.from(rawDataContract.$id, EncodedBuffer.ENCODING.BASE58);
    this.ownerId = EncodedBuffer.from(rawDataContract.ownerId, EncodedBuffer.ENCODING.BASE58);

    this.setJsonMetaSchema(rawDataContract.$schema);
    this.setDocuments(rawDataContract.documents);
    this.setDefinitions(rawDataContract.definitions);

    this.encodedProperties = {};
  }

  /**
   * Get Data Contract protocol version
   *
   * @returns {number}
   */
  getProtocolVersion() {
    return this.protocolVersion;
  }

  /**
   * Get ID
   *
   * @return {EncodedBuffer}
   */
  getId() {
    return this.id;
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
   * Get JSON Schema ID
   *
   * @return {string}
   */
  getJsonSchemaId() {
    return this.getId().toString();
  }

  /**
   *
   * @param {string} schema
   */
  setJsonMetaSchema(schema) {
    this.schema = schema;

    return this;
  }

  /**
   *
   * @return {string}
   */
  getJsonMetaSchema() {
    return this.schema;
  }

  /**
   *
   * @param {Object<string, Object>} documents
   * @return {DataContract}
   */
  setDocuments(documents) {
    this.documents = documents;

    return this;
  }

  /**
   *
   * @return {Object<string, Object>}
   */
  getDocuments() {
    return this.documents;
  }

  /**
   * Returns true if document type is defined
   *
   * @param {string} type
   * @return {boolean}
   */
  isDocumentDefined(type) {
    return Object.prototype.hasOwnProperty.call(this.documents, type);
  }

  /**
   *
   * @param {string} type
   * @param {object} schema
   * @return {DataContract}
   */
  setDocumentSchema(type, schema) {
    this.documents[type] = schema;

    return this;
  }

  /**
   *
   * @param {string} type
   * @return {Object}
   */
  getDocumentSchema(type) {
    if (!this.isDocumentDefined(type)) {
      throw new InvalidDocumentTypeError(type, this);
    }

    return this.documents[type];
  }

  /**
   * @param {string} type
   * @return {{$ref: string}}
   */
  getDocumentSchemaRef(type) {
    if (!this.isDocumentDefined(type)) {
      throw new InvalidDocumentTypeError(type, this);
    }

    return { $ref: `${this.getJsonSchemaId()}#/documents/${type}` };
  }


  /**
   * @param {Object<string, Object>} definitions
   * @return {DataContract}
   */
  setDefinitions(definitions) {
    this.definitions = definitions;

    return this;
  }

  /**
   * @return {Object<string, Object>}
   */
  getDefinitions() {
    return this.definitions;
  }

  /**
   * Get properties with `contentEncoding` constraint
   *
   * @param {string} type
   *
   * @return {Object}
   */
  getEncodedProperties(type) {
    if (!this.isDocumentDefined(type)) {
      throw new InvalidDocumentTypeError(type, this);
    }

    if (this.encodedProperties[type]) {
      return this.encodedProperties[type];
    }

    this.encodedProperties[type] = getEncodedPropertiesFromSchema(
      this.documents[type],
    );

    return this.encodedProperties[type];
  }

  /**
   * Return Data Contract as plain object
   *
   * @return {RawDataContract}
   */
  toObject() {
    const plainObject = {
      protocolVersion: this.getProtocolVersion(),
      $id: this.getId().toBuffer(),
      $schema: this.getJsonMetaSchema(),
      ownerId: this.getOwnerId().toBuffer(),
      documents: this.getDocuments(),
    };

    const definitions = this.getDefinitions();

    if (definitions && Object.getOwnPropertyNames(definitions).length) {
      plainObject.definitions = definitions;
    }

    return plainObject;
  }

  /**
   * Return Data Contract as JSON object
   *
   * @return {JsonDataContract}
   */
  toJSON() {
    const json = {
      protocolVersion: this.getProtocolVersion(),
      $id: this.getId().toString(),
      $schema: this.getJsonMetaSchema(),
      ownerId: this.getOwnerId().toString(),
      documents: this.getDocuments(),
    };

    const definitions = this.getDefinitions();

    if (definitions && Object.getOwnPropertyNames(definitions).length) {
      json.definitions = definitions;
    }

    return json;
  }

  /**
   * Return Data Contract as a Buffer
   *
   * @returns {Buffer}
   */
  toBuffer() {
    return encode(this.toObject());
  }

  /**
   * Returns hex string with Data Contract hash
   *
   * @return {string}
   */
  hash() {
    return hash(this.serialize()).toString('hex');
  }

  /**
   * Set Data Contract entropy
   *
   * @param {Buffer} entropy
   * @return {DataContract}
   */
  setEntropy(entropy) {
    this.entropy = EncodedBuffer.from(entropy, EncodedBuffer.ENCODING.BASE58);

    return this;
  }

  /**
   * Get Data Contract entropy
   *
   * @return {EncodedBuffer}
   */
  getEntropy() {
    return this.entropy;
  }
}

/**
 * @typedef {Object} RawDataContract
 * @property {number} protocolVersion
 * @property {Buffer} $id
 * @property {string} $schema
 * @property {Buffer} ownerId
 * @property {Object<string, Object>} documents
 * @property {Object<string, Object>} [definitions]
 */

/**
 * @typedef {Object} JsonDataContract
 * @property {number} protocolVersion
 * @property {string} $id
 * @property {string} $schema
 * @property {string} ownerId
 * @property {Object<string, Object>} documents
 * @property {Object<string, Object>} [definitions]
 */

DataContract.PROTOCOL_VERSION = 0;

DataContract.DEFAULTS = {
  SCHEMA: 'https://schema.dash.org/dpp-0-4-0/meta/data-contract',
};

DataContract.ENCODED_PROPERTIES = {
  $id: {
    contentEncoding: 'base58',
  },
  ownerId: {
    contentEncoding: 'base58',
  },
};

module.exports = DataContract;
