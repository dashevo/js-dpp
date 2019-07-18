const ConsensusError = require('./ConsensusError');

class DataTriggerExecutionError extends ConsensusError {
  constructor() {
    super('Data trigger execution failed');
  }
}

module.exports = DataTriggerExecutionError;
