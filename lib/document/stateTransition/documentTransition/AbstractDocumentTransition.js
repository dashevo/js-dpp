const lodashGet = require('lodash.get');
const lodashSet = require('lodash.set');

/**
 * @abstract
 */
class AbstractDocumentTransition {
  constructor(rawDocumentTransition, dataContract) {
    this.dataContractId = rawDocumentTransition.$dataContractId;
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
   * @return {string}
   */
  getDataContractId() {
    return this.dataContractId;
  }

  /**
   * Get data
   *
   * @return {Object}
   */
  getData() {
    return {};
  }

  /**
   * @abstract
   *
   * @return {Object}
   */
  getSystemProperties() {
    throw new Error('Not implemented');
  }

  /**
   * Get JSON representation
   *
   * @return {Object}
   */
  toJSON() {
    const data = JSON.parse(
      JSON.stringify(this.getData()),
    );

    const encodedProperties = this.dataContract.getEncodedProperties(
      this.getType(),
    );

    Object.keys(encodedProperties)
      .forEach((propertyPath) => {
        const property = encodedProperties[propertyPath];

        if (property.contentEncoding === 'binary') {
          const value = lodashGet(data, propertyPath);
          if (value !== undefined) {
            lodashSet(
              data,
              propertyPath,
              Buffer.from(value)
                .toString('utf-8'),
            );
          }
        }
      });

    return {
      $action: this.getAction(),
      $dataContractId: this.getDataContractId(),
      ...this.getSystemProperties(),
      ...data,
    };
  }

  /**
   * Get plain object representation
   *
   * @returns {Object}
   */
  toObject() {
    return {
      $action: this.getAction(),
      $dataContractId: this.getDataContractId(),
      ...this.getSystemProperties(),
      ...this.getData(),
    };
  }

  /**
   * Create document transition from JSON
   *
   * @param {Class} documentTransitionClass
   * @param {
   *   RawDocumentCreateTransition | RawDocumentReplaceTransition | RawDocumentDeleteTransition
   * } rawDocumentTransition
   * @param {DataContract} dataContract
   *
   * @return {
   *   RawDocumentCreateTransition | RawDocumentReplaceTransition | RawDocumentDeleteTransition
   * }
   */
  static fromJSON(documentTransitionClass, rawDocumentTransition, dataContract) {
    const encodedProperties = dataContract.getEncodedProperties(
      rawDocumentTransition.$type,
    );

    Object.keys(encodedProperties)
      .forEach((propertyPath) => {
        const property = encodedProperties[propertyPath];

        if (property.contentEncoding === 'binary') {
          const value = lodashGet(rawDocumentTransition, propertyPath);
          if (value !== undefined) {
            lodashSet(
              rawDocumentTransition,
              propertyPath,
              Buffer.from(value, 'utf-8'),
            );
          }
        }
      });

    // eslint-disable-next-line new-cap
    return new documentTransitionClass(rawDocumentTransition, dataContract);
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
