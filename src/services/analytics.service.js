const Event = require('../models/Event');

// "Fire and forget": we deliberately do NOT await this or make callers await
// it. Logging an analytics event should never slow down or break the actual
// user-facing action it's attached to. If the write fails for any reason, we
// just log it to the console instead of crashing or blocking anything.
function logEvent(type, metadata = {}) {
  Event.create({ type, metadata }).catch((error) => {
    console.error('Failed to log event:', type, error.message);
  });
}

module.exports = { logEvent };
