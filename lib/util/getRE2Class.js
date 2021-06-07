const EventEmitter = require('events');
const RE2Loader = require('@dashevo/re2-wasm').default;

const eventNames = {
  LOADED_EVENT: 'LOADED',
};

const events = new EventEmitter();
let isLoading = false;
let instance = null;

async function compileWasmModule() {
  isLoading = true;
  instance = await RE2Loader();
  isLoading = false;
  events.emit(eventNames.LOADED_EVENT);
}

/**
 *
 * @returns {Promise<RE2>}
 */
async function getRE2Class() {
  return new Promise((resolve) => {
    if (instance !== null) {
      resolve(instance);

      return;
    }

    if (isLoading) {
      events.once(eventNames.LOADED_EVENT, () => {
        resolve(instance);
      });
    } else {
      compileWasmModule().then(() => {
        resolve(instance);
      });
    }
  });
}

module.exports = getRE2Class;
