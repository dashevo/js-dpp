const lodashGet = require('lodash.get');
const lodashSet = require('lodash.set');

const AbstractDocumentTransition = require('./AbstractDocumentTransition');

class DocumentCreateTransition extends AbstractDocumentTransition {
  /**
   * @param {RawDocumentCreateTransition} rawTransition
   * @param {DataContract} dataContract
   */
  constructor(rawTransition, dataContract) {
    super(rawTransition);

    this.dataContract = dataContract;

    const data = { ...rawTransition };

    this.id = rawTransition.$id;
    this.type = rawTransition.$type;
    this.entropy = rawTransition.$entropy;

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

    this.data = data;
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
   * @returns {string}
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
   * @returns {string}
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
   * Get document transition as a plain object
   * with encoded binary fields
   *
   * @return {RawDocumentCreateTransition}
   */
  toJSON() {
    const data = JSON.parse(
      JSON.stringify(this.data),
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
      ...this.getSystemProperties(),
      ...data,
    };
  }

  /**
   * Get document transition as a plain object
   * without encoded binary fields
   *
   * @return {RawDocumentCreateTransition}
   */
  toObject() {
    return {
      ...this.getSystemProperties(),
      ...this.data,
    };
  }

  /**
   * @private
   *
   * @return {Object}
   */
  getSystemProperties() {
    const rawDocumentTransition = {
      ...super.toJSON(),
      $id: this.getId(),
      $type: this.getType(),
      $entropy: this.getEntropy(),
    };

    if (this.createdAt) {
      rawDocumentTransition.$createdAt = this.getCreatedAt().getTime();
    }

    if (this.updatedAt) {
      rawDocumentTransition.$updatedAt = this.getUpdatedAt().getTime();
    }

    return rawDocumentTransition;
  }
}

/**
 * @typedef {Object} RawDocumentCreateTransition
 * @property {number} $action
 * @property {string} $id
 * @property {string} $type
 * @property {string} $entropy
 * @property {number} [$createdAt]
 * @property {number} [$updatedAt]
 */

DocumentCreateTransition.INITIAL_REVISION = 1;

module.exports = DocumentCreateTransition;
