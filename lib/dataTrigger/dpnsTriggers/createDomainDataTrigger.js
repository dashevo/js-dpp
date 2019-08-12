const multihash = require('../../util/multihash');

const DataTriggerExecutionResult = require('../DataTriggerExecutionResult');
const DataTriggerConditionError = require('../../errors/DataTriggerConditionError');

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
    hash,
    label,
    normalizedLabel,
    normalizedParentDomainName,
    preorderSalt,
    records,
  } = document.getData();

  const result = new DataTriggerExecutionResult();

  if (hash !== multihash(Buffer.from(normalizedLabel)).toString('hex')) {
    result.addError(
      new DataTriggerConditionError(
        document, context, 'Document hash doesn\'t match actual hash',
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

  const fullDomainName = `${label}.${normalizedParentDomainName}`;

  if (fullDomainName.length > 253) {
    result.addError(
      new DataTriggerConditionError(
        document, context, 'Full domain name length can not be more than 253 characters long',
      ),
    );
  }

  const parentDomainHash = multihash(Buffer.from(normalizedParentDomainName))
    .toString('hex');

  const [parentDomain] = await context.getDataProvider().fetchDocuments(
    context.getContract().getId(),
    document.getType(),
    { where: ['hash', '==', parentDomainHash] },
  );

  if (!parentDomain) {
    result.addError(
      new DataTriggerConditionError(
        document, context, 'Can\'t find parent domain matching parent hash',
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

  if (context.getUserId() !== records.dashIdentity) {
    result.addError(
      new DataTriggerConditionError(
        document, context, 'userId doesn\'t match dashIdentity',
      ),
    );
  }

  const saltedDomainHash = multihash(Buffer.from(preorderSalt + hash, 'hex'))
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

  const isHashValidMultihash = multihash.validate(Buffer.from(hash, 'hex'));

  if (!isHashValidMultihash) {
    result.addError(
      new DataTriggerConditionError(
        document, context, 'hash is not a valid multihash',
      ),
    );
  }

  return result;
}

module.exports = createDomainDataTrigger;
