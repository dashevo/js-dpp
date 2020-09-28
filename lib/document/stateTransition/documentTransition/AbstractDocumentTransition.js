const lodashGet = require('lodash.get');

const transpileEncodedProperties = require('../../../util/encoding/transpileEncodedProperties');
const EncodedBuffer = require('../../../util/encoding/EncodedBuffer');

/**
 * @abstract
 */
class AbstractDocumentTransition {
  constructor(rawDocumentTransition, dataContract) {
    this.dataContractId = EncodedBuffer.from(
      rawDocumentTransition.$dataContractId,
      EncodedBuffer.ENCODING.BASE58,
    );
    this.dataContract = dataContract;
  }

  /**
   * @abstract
   */
  getAction() {
    throw new Error('Not implemented');
  }

  /**
   * Get Data Contract ID
   *
   * @return {EncodedBuffer}
   */
  getDataContractId() {
    return this.dataContractId;
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
      $action: this.getAction(),
      $dataContractId: this.getDataContractId(),
    };

    if (!options.encodedBuffer) {
      rawDocumentTransition = {
        ...rawDocumentTransition,
        $dataContractId: rawDocumentTransition.$dataContractId.toBuffer(),
      };
    }

    return rawDocumentTransition;
  }

  /**
   * Get transition property by path
   *
   * @param {string} propertyPath
   *
   * @return {*}
   */
  get(propertyPath) {
    return lodashGet(this.getData(), propertyPath);
  }

  /**
   * Get JSON representation
   *
   * @return {Object}
   */
  toJSON() {
    let data = this.toObject({ encodedBuffer: true });

    data = {
      ...data,
      $dataContractId: data.$dataContractId.toString(),
    };

    return transpileEncodedProperties(
      this.dataContract,
      this.getType(),
      data,
      (encodedBuffer) => encodedBuffer.toString(),
    );
  }

  /**
   * Translate document transition from JSON to plain object
   *
   * @protected
   *
   * @param {
   *   RawDocumentCreateTransition | RawDocumentReplaceTransition | RawDocumentDeleteTransition
   * } rawDocumentTransition
   * @param {DataContract} dataContract
   *
   * @return {
   *   RawDocumentCreateTransition | RawDocumentReplaceTransition | RawDocumentDeleteTransition
   * }
   */
  static translateJsonToObject(rawDocumentTransition, dataContract) {
    return transpileEncodedProperties(
      dataContract,
      rawDocumentTransition.$type,
      rawDocumentTransition,
      (string, encoding) => EncodedBuffer.from(string, encoding).toBuffer(),
    );
  }
}

AbstractDocumentTransition.ACTIONS = {
  CREATE: 0,
  REPLACE: 1,
  // 2 reserved for UPDATE
  DELETE: 3,
};

AbstractDocumentTransition.ACTION_NAMES = {
  CREATE: 'create',
  REPLACE: 'replace',
  DELETE: 'delete',
};

module.exports = AbstractDocumentTransition;
