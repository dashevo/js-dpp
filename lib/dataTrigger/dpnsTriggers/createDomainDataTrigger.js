const multihash = require('../../util/multihash');

const DataTriggerExecutionResult = require('../DataTriggerExecutionResult');
const DataTriggerConditionError = require('../../errors/DataTriggerConditionError');

const MIN_CONFIRMATIONS = 6;
const MAX_PRINTABLE_DOMAIN_NAME_LENGTH = 253;

/**
 * Data trigger for domain creation process
 *
 * @param {Document} document
 * @param {DataTriggerExecutionContext} context
 *
 * @return {Promise<DataTriggerExecutionResult>}
 */
async function createDomainDataTrigger(document, context) {
  const {
    nameHash,
    label,
    normalizedLabel,
    normalizedParentDomainName,
    preorderSalt,
    records,
  } = document.getData();

  const result = new DataTriggerExecutionResult();

  const fullDomainName = `${label}.${normalizedParentDomainName}`;

  if (fullDomainName.length > MAX_PRINTABLE_DOMAIN_NAME_LENGTH) {
    result.addError(
      new DataTriggerConditionError(
        document, context, 'Full domain name length can not be more than 253 characters long',
      ),
    );
  }

  const isHashValidMultihash = multihash.validate(Buffer.from(nameHash, 'hex'));

  if (!isHashValidMultihash) {
    result.addError(
      new DataTriggerConditionError(
        document, context, 'nameHash is not a valid multihash',
      ),
    );
  }

  if (nameHash !== multihash(Buffer.from(fullDomainName)).toString('hex')) {
    result.addError(
      new DataTriggerConditionError(
        document, context, 'Document nameHash doesn\'t match actual hash',
      ),
    );
  }

  if (normalizedLabel !== label.toLowerCase()) {
    result.addError(
      new DataTriggerConditionError(
        document, context, 'Normalized label doesn\'t match label',
      ),
    );
  }

  const parentDomainHash = multihash(Buffer.from(normalizedParentDomainName))
    .toString('hex');

  const [parentDomain] = await context.getDataProvider().fetchDocuments(
    context.getContract().getId(),
    document.getType(),
    { where: ['nameHash', '==', parentDomainHash] },
  );

  if (!parentDomain) {
    result.addError(
      new DataTriggerConditionError(
        document, context, 'Can\'t find parent domain matching parent hash',
      ),
    );
  }

  if (context.getUserId() !== records.dashIdentity) {
    result.addError(
      new DataTriggerConditionError(
        document, context, 'userId doesn\'t match dashIdentity',
      ),
    );
  }

  const fetchedTransaction = await context.getDataProvider().fetchTransaction(
    records.dashIdentity,
  );

  if (fetchedTransaction === null) {
    result.addError(
      new DataTriggerConditionError(
        document, context, 'dashIdentity with corresponding id was not found',
      ),
    );
  }

  if (fetchedTransaction.confirmations < MIN_CONFIRMATIONS) {
    result.addError(
      new DataTriggerConditionError(
        document, context, 'dashIdentity transaction is not confirmed',
      ),
    );
  }

  const saltedDomainHash = multihash(Buffer.from(preorderSalt + nameHash, 'hex'))
    .toString('hex');

  const [preorderDocument] = await context.getDataProvider()
    .fetchDocuments(
      context.getContract().getId(),
      'preorder',
      { where: ['saltedDomainHash', '==', saltedDomainHash] },
    );

  if (!preorderDocument) {
    result.addError(
      new DataTriggerConditionError(
        document, context, 'preorderDocument was not found',
      ),
    );
  }

  return result;
}

module.exports = createDomainDataTrigger;
