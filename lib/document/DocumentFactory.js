const Document = require('./Document');

const { decode } = require('../util/serializer');
const entropy = require('../util/entropy');

const DocumentsStateTransition = require('./stateTransition/DocumentsStateTransition');

const AbstractSubTransition = require('./stateTransition/subTransition/AbstractSubTransition');
const DocumentCreateTransition = require('./stateTransition/subTransition/DocumentCreateTransition');
const DocumentReplaceTransition = require('./stateTransition/subTransition/DocumentReplaceTransition');
const DocumentDeleteTransition = require('./stateTransition/subTransition/DocumentDeleteTransition');

const InvalidActionNameError = require('./errors/InvalidActionNameError');
const NoDocumentsSuppliedError = require('./errors/NoDocumentsSuppliedError');
const MismatchContractIdsError = require('./errors/MismatchContractIdsError');
const MismatchOwnerIdsError = require('./errors/MismatchOwnerIdsError');

const InvalidDocumentError = require('./errors/InvalidDocumentError');
const InvalidDocumentTypeError = require('../errors/InvalidDocumentTypeError');
const SerializedObjectParsingError = require('../errors/SerializedObjectParsingError');

const generateDocumentId = require('./generateDocumentId');

class DocumentFactory {
  /**
   * @param {validateDocument} validateDocument
   * @param {fetchAndValidateDataContract} fetchAndValidateDataContract
   */
  constructor(validateDocument, fetchAndValidateDataContract) {
    this.validateDocument = validateDocument;
    this.fetchAndValidateDataContract = fetchAndValidateDataContract;
  }

  /**
   * Create Document
   *
   * @param {DataContract} dataContract
   * @param {string} ownerId
   * @param {string} type
   * @param {Object} [data]
   * @return {Document}
   */
  create(dataContract, ownerId, type, data = {}) {
    if (!dataContract.isDocumentDefined(type)) {
      throw new InvalidDocumentTypeError(type, dataContract);
    }

    const documentEntropy = entropy.generate();
    const contractId = dataContract.getId();

    const id = generateDocumentId(
      contractId,
      ownerId,
      type,
      documentEntropy,
    );

    const rawDocument = {
      $id: id,
      $type: type,
      $contractId: contractId,
      $ownerId: ownerId,
      $entropy: documentEntropy,
      $rev: Document.DEFAULTS.REVISION,
      ...data,
    };

    const document = new Document(rawDocument);

    document.setAction(Document.DEFAULTS.ACTION);

    return document;
  }

  /**
   * Create Document from plain object
   *
   * @param {RawDocument} rawDocument
   * @param {Object} options
   * @param {boolean} [options.skipValidation=false]
   * @param {boolean} [options.action]
   * @return {Document}
   */
  async createFromObject(rawDocument, options = {}) {
    const opts = { skipValidation: false, ...options };

    if (!opts.skipValidation) {
      const result = await this.fetchAndValidateDataContract(rawDocument);

      if (result.isValid()) {
        const dataContract = result.getData();

        result.merge(
          this.validateDocument(
            rawDocument,
            dataContract,
            opts,
          ),
        );
      }

      if (!result.isValid()) {
        throw new InvalidDocumentError(result.getErrors(), rawDocument);
      }
    }

    return new Document(rawDocument);
  }

  /**
   * Create Document from string/buffer
   *
   * @param {Buffer|string} payload
   * @param {Object} options
   * @param {boolean} [options.skipValidation=false]
   * @param {boolean} [options.action]
   * @return {Promise<Document>}
   */
  async createFromSerialized(payload, options = { }) {
    let rawDocument;
    try {
      rawDocument = decode(payload);
    } catch (error) {
      throw new InvalidDocumentError([
        new SerializedObjectParsingError(
          payload,
          error,
        ),
      ]);
    }

    return this.createFromObject(rawDocument, options);
  }

  /**
   * Create Documents State Transition
   *
   * @param { { create: Document[], replace: Document[], delete: Document[] } } documents
   *
   * @return {DocumentsStateTransition}
   */
  createStateTransition(documents) {
    // Check no wrong actions were supplied
    const allowedKeys = Object.values(AbstractSubTransition.ACTIONS);

    const actionKeys = Object.keys(documents);
    const filteredKeys = actionKeys
      .filter((key) => allowedKeys.indexOf(key) === -1);

    if (filteredKeys.length > 0) {
      throw new InvalidActionNameError(filteredKeys);
    }

    const documentsFlattened = actionKeys
      .reduce((all, t) => all.concat(documents[t]), []);

    if (documentsFlattened.length === 0) {
      throw new NoDocumentsSuppliedError();
    }

    // Check that documents are not mixed
    const [aDocument] = documentsFlattened;

    const contractId = aDocument.getDataContractId();
    const ownerId = aDocument.getOwnerId();

    const {
      mismatchedContractIdsLength,
      mismatchedOwnerIdsLength,
    } = documentsFlattened
      .reduce((result, document) => {
        if (document.getDataContractId() !== contractId) {
          // eslint-disable-next-line no-param-reassign
          result.mismatchedContractIdsLength += 1;
        }

        if (document.getOwnerId() !== ownerId) {
          // eslint-disable-next-line no-param-reassign
          result.mismatchedOwnerIdsLength += 1;
        }

        return result;
      }, { mismatchedContractIdsLength: 0, mismatchedOwnerIdsLength: 0 });

    if (mismatchedContractIdsLength > 0) {
      throw new MismatchContractIdsError(documentsFlattened);
    }

    if (mismatchedOwnerIdsLength > 0) {
      throw new MismatchOwnerIdsError(documentsFlattened);
    }

    // Convert documents to sub-transitions
    const {
      [AbstractSubTransition.ACTIONS.CREATE]: createDocuments,
      [AbstractSubTransition.ACTIONS.REPLACE]: replaceDocuments,
      [AbstractSubTransition.ACTIONS.DELETE]: deleteDocuments,
    } = documents;

    const createDocumentSubTransitions = (createDocuments || [])
      .map((document) => new DocumentCreateTransition({
        $id: document.getId(),
        $type: document.getType(),
        $entropy: document.entropy,
        ...document.getData(),
      }));

    const replaceDocumentSubTransitions = (replaceDocuments || [])
      .map((document) => new DocumentReplaceTransition({
        $id: document.getId(),
        ...document.getData(),
      }));

    const deleteDocumentSubTransitions = (deleteDocuments || [])
      .map((document) => new DocumentDeleteTransition({
        $id: document.getId(),
        $type: document.getType(),
      }));

    const subTransitions = createDocumentSubTransitions
      .concat(replaceDocumentSubTransitions)
      .concat(deleteDocumentSubTransitions);

    return new DocumentsStateTransition(
      contractId,
      ownerId,
      subTransitions,
    );
  }
}

module.exports = DocumentFactory;
