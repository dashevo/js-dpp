const lodashGet = require('lodash.get');
const lodashSet = require('lodash.set');

const AbstractDocumentTransition = require('./AbstractDocumentTransition');

class DocumentReplaceTransition extends AbstractDocumentTransition {
  /**
   * @param {RawDocumentReplaceTransition} rawTransition
   * @param {DataContract} dataContract
   */
  constructor(rawTransition, dataContract) {
    super(rawTransition);

    this.dataContract = dataContract;

    const data = { ...rawTransition };

    this.id = rawTransition.$id;
    this.type = rawTransition.$type;
    this.revision = rawTransition.$revision;

    if (rawTransition.$updatedAt) {
      this.updatedAt = new Date(rawTransition.$updatedAt);
    }

    delete data.$id;
    delete data.$type;
    delete data.$action;
    delete data.$revision;
    delete data.$dataContractId;
    delete data.$updatedAt;

    this.data = data;
  }

  /**
   * Get action
   *
   * @returns {number}
   */
  getAction() {
    return AbstractDocumentTransition.ACTIONS.REPLACE;
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
   * Get document type
   *
   * @return {string}
   */
  getType() {
    return this.type;
  }

  /**
   * Get next document revision
   *
   * @return {number}
   */
  getRevision() {
    return this.revision;
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
      $revision: this.getRevision(),
    };

    if (this.getUpdatedAt()) {
      rawDocumentTransition.$updatedAt = this.getUpdatedAt().getTime();
    }

    return rawDocumentTransition;
  }
}

/**
 * @typedef {Object} RawDocumentReplaceTransition
 * @property {number} $action
 * @property {string} $id
 * @property {string} $type
 * @property {number} $revision
 * @property {number} [$updatedAt]
 */

module.exports = DocumentReplaceTransition;
