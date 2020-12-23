const DataTriggerExecutionResult = require('../DataTriggerExecutionResult');
const DataTriggerConditionError = require('../../errors/DataTriggerConditionError');

const BLOCKS_WINDOW_SIZE = 5;

/**
 * @param {DocumentCreateTransition} documentTransition
 * @param {DataTriggerExecutionContext} context
 * @param {Identifier|Buffer} topLevelIdentity
 *
 * @return {Promise<DataTriggerExecutionResult>}
 */
async function createContactRequestDataTrigger(documentTransition, context, topLevelIdentity) {
  const {
    $coreHeightCreatedAt: coreHeightCreatedAt,
  } = documentTransition.getData();

  const result = new DataTriggerExecutionResult();

  const stateRepository = context.getStateRepository();

  const latestPlatformBlockHeader = await stateRepository.fetchLatestPlatformBlockHeader();

  const { coreChainLockedHeight } = latestPlatformBlockHeader;

  const heightWindowStart = coreChainLockedHeight - BLOCKS_WINDOW_SIZE;
  const heightWindowEnd = coreChainLockedHeight + BLOCKS_WINDOW_SIZE;

  if (coreHeightCreatedAt < heightWindowStart || coreHeightCreatedAt > heightWindowEnd) {
    result.addError(
      new DataTriggerConditionError(
        documentTransition,
        context.getDataContract(),
        context.getOwnerId(),
        'Core Height is out of block height window',
      ),
    );
  }

  return result;
}

module.exports = createContactRequestDataTrigger;
