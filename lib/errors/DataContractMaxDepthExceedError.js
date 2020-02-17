const ConsensusError = require('./ConsensusError');

class DataContractMaxDepthExceedError extends ConsensusError {
  constructor() {
    super(`Data Contract depth is greater than ${DataContractMaxDepthExceedError.MAX_DEPTH}`);
  }
}

DataContractMaxDepthExceedError.MAX_DEPTH = 5000;

module.exports = DataContractMaxDepthExceedError;
