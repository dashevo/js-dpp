const ConsensusError = require('./ConsensusError');

class DataContractMaxDepthExceedError extends ConsensusError {
  constructor() {
    super(`Data Contract depth is greater than ${DataContractMaxDepthExceedError.MAX_DEPTH}`);
  }
}

DataContractMaxDepthExceedError.MAX_DEPTH = 500;

module.exports = DataContractMaxDepthExceedError;
