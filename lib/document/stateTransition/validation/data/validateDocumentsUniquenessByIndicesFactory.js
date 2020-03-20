const ValidationResult = require('../../../../validation/ValidationResult');
const DuplicateDocumentError = require('../../../../errors/DuplicateDocumentError');

/**
 * @param {DataProvider} dataProvider
 * @return {validateDocumentsUniquenessByIndices}
 */
function validateDocumentsUniquenessByIndicesFactory(dataProvider) {
  /**
   * @typedef validateDocumentsUniquenessByIndices
   * @param {string} ownerId
   * @param {DocumentCreateTransition[]
   *         |DocumentReplaceTransition[]} documentActionTransitions
   * @param {DataContract} dataContract
   * @return {ValidationResult}
   */
  async function validateDocumentsUniquenessByIndices(
    ownerId,
    documentActionTransitions,
    dataContract,
  ) {
    const result = new ValidationResult();

    // 1. Prepare fetchDocuments queries from indexed properties
    const documentIndexQueries = documentActionTransitions
      .reduce((queries, actionTransition) => {
        const documentSchema = dataContract.getDocumentSchema(actionTransition.getType());

        if (!documentSchema.indices) {
          return queries;
        }

        documentSchema.indices
          .filter((index) => index.unique)
          .forEach((indexDefinition) => {
            const where = indexDefinition.properties
              .map((property) => {
                const propertyName = Object.keys(property)[0];

                let propertyValue;
                if (propertyName === '$ownerId') {
                  propertyValue = ownerId;
                } else {
                  propertyValue = actionTransition.get(propertyName);
                }

                return [propertyName, '==', propertyValue];
              });

            queries.push({
              type: actionTransition.getType(),
              indexDefinition,
              actionTransition,
              where,
            });
          });

        return queries;
      }, []);

    // 2. Fetch Document by indexed properties
    const fetchRawDocumentPromises = documentIndexQueries
      .map(({
        type,
        where,
        indexDefinition,
        actionTransition,
      }) => (
        dataProvider.fetchDocuments(
          dataContract.getId(),
          type,
          { where },
        )
          .then((doc) => Object.assign(doc, {
            indexDefinition,
            actionTransition,
          }))
      ));

    const fetchedDocumentsByIndices = await Promise.all(fetchRawDocumentPromises);

    // 3. Create errors if duplicates found
    fetchedDocumentsByIndices
      .filter((docs) => {
        const isEmpty = docs.length === 0;
        const onlyOriginDocument = docs.length === 1
          && docs[0].getId() === docs.actionTransition.getId();

        return !isEmpty && !onlyOriginDocument;
      }).forEach((rawDocuments) => {
        result.addError(
          new DuplicateDocumentError(
            rawDocuments.actionTransition,
            rawDocuments.indexDefinition,
          ),
        );
      });

    return result;
  }

  return validateDocumentsUniquenessByIndices;
}

module.exports = validateDocumentsUniquenessByIndicesFactory;
