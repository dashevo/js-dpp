const JsonSchemaValidator = require('../validation/JsonSchemaValidator');
const ValidationResult = require('../validation/ValidationResult');

const DataContract = require('./DataContract');

const DuplicateIndexError = require('../errors/DuplicateIndexError');
const UndefinedIndexPropertyError = require('../errors/UndefinedIndexPropertyError');
const InvalidIndexPropertyTypeError = require('../errors/InvalidIndexPropertyTypeError');
const SystemPropertyIndexAlreadyPresentError = require('../errors/SystemPropertyIndexAlreadyPresentError');
const DataContractRestrictedIdentityError = require('../errors/DataContractRestrictedIdentityError');
const UniqueIndicesLimitReached = require('../errors/UniqueIndicesLimitReached');
const DataContractMaxByteSizeExceededError = require('../errors/DataContractMaxByteSizeExceededError');

const getPropertyDefinitionByPath = require('./getPropertyDefinitionByPath');

const { encode } = require('../util/serializer');

const systemProperties = ['$id', '$userId'];
const prebuiltIndices = ['$id'];

const MAX_SERIALIZED_DATA_CONTRACT_BYTE_SIZE = 15 * 1024; // 15 Kb

/**
 * @param validator
 * @return {validateDataContract}
 */
module.exports = function validateDataContractFactory(validator) {
  /**
   * @typedef validateDataContract
   * @param {DataContract|RawDataContract} dataContract
   * @return {ValidationResult}
   */
  function validateDataContract(dataContract) {
    const rawDataContract = (dataContract instanceof DataContract)
      ? dataContract.toJSON()
      : dataContract;
    const allowedIdentities = process.env.ALLOWED_IDENTITIES ? process.env.ALLOWED_IDENTITIES.split(',') : [];

    // TODO: Use validateSchema
    //  https://github.com/epoberezkin/ajv#validateschemaobject-schema---boolean

    const serializedDataContract = encode(rawDataContract);
    const serializedDataContractByteSize = Buffer.byteLength(serializedDataContract);

    if (serializedDataContractByteSize > MAX_SERIALIZED_DATA_CONTRACT_BYTE_SIZE) {
      return new ValidationResult([
        new DataContractMaxByteSizeExceededError(
          rawDataContract,
          MAX_SERIALIZED_DATA_CONTRACT_BYTE_SIZE,
        ),
      ]);
    }

    const result = validator.validate(
      JsonSchemaValidator.SCHEMAS.META.DATA_CONTRACT,
      rawDataContract,
    );

    if (!result.isValid()) {
      return result;
    }

    const contractIdentityId = rawDataContract.contractId;

    if (allowedIdentities.length > 0 && !allowedIdentities.includes(contractIdentityId)) {
      result.addError(new DataContractRestrictedIdentityError(rawDataContract));
      return result;
    }

    // Validate indices
    Object.entries(rawDataContract.documents).filter(([, documentSchema]) => (
      Object.prototype.hasOwnProperty.call(documentSchema, 'indices')
    ))
      .forEach(([documentType, documentSchema]) => {
        const indicesFingerprints = [];
        let uniqueIndexCount = 0;
        let isUniqueIndexLimitReached = false;

        documentSchema.indices.forEach((indexDefinition) => {
          if (!isUniqueIndexLimitReached && indexDefinition.unique) {
            uniqueIndexCount++;

            if (uniqueIndexCount > UniqueIndicesLimitReached.UNIQUE_INDEX_LIMIT) {
              isUniqueIndexLimitReached = true;

              result.addError(new UniqueIndicesLimitReached(
                rawDataContract,
                documentType,
              ));
            }
          }

          const indexPropertyNames = indexDefinition.properties
            .map((property) => Object.keys(property)[0]);

          prebuiltIndices
            .forEach((propertyName) => {
              const isSingleIndex = indexPropertyNames.length === 1
                    && indexPropertyNames[0] === propertyName;

              if (isSingleIndex) {
                result.addError(new SystemPropertyIndexAlreadyPresentError(
                  rawDataContract,
                  documentType,
                  indexDefinition,
                  propertyName,
                ));
              }
            });

          indexPropertyNames.forEach((propertyName) => {
            const propertyDefinition = (getPropertyDefinitionByPath(
              documentSchema, propertyName,
            ) || {});

            const { type: propertyType } = propertyDefinition;

            let invalidPropertyType;

            if (propertyType === 'object') {
              invalidPropertyType = 'object';
            }

            if (propertyType === 'array') {
              const { items } = propertyDefinition;

              if (Array.isArray(items) || items.type === 'object' || items.type === 'array') {
                invalidPropertyType = 'array';
              }
            }

            if (invalidPropertyType) {
              result.addError(new InvalidIndexPropertyTypeError(
                rawDataContract,
                documentType,
                indexDefinition,
                propertyName,
                invalidPropertyType,
              ));
            }
          });

          const indicesFingerprint = JSON.stringify(indexDefinition.properties);

          // Ensure index definition uniqueness
          if (indicesFingerprints.includes(indicesFingerprint)) {
            result.addError(
              new DuplicateIndexError(
                rawDataContract,
                documentType,
                indexDefinition,
              ),
            );
          }

          indicesFingerprints.push(indicesFingerprint);

          // Ensure index properties definition
          const userDefinedProperties = indexPropertyNames
            .filter((name) => systemProperties.indexOf(name) === -1);

          userDefinedProperties.filter((propertyName) => (
            !getPropertyDefinitionByPath(documentSchema, propertyName)
          ))
            .forEach((undefinedPropertyName) => {
              result.addError(
                new UndefinedIndexPropertyError(
                  rawDataContract,
                  documentType,
                  indexDefinition,
                  undefinedPropertyName,
                ),
              );
            });
        });
      });

    return result;
  }

  return validateDataContract;
};
