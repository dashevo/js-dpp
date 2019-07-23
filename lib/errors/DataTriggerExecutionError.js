const ConsensusError = require('./ConsensusError');

class DataTriggerExecutionError extends ConsensusError {
  constructor(message = 'Error occurred while executing Data Trigger') {
    super(message);
  }
}

module.exports = DataTriggerExecutionError;
