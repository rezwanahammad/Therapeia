const EventEmitter = require('events');

class EventsBus extends EventEmitter {}

// Singleton bus for app-wide events
const bus = new EventsBus();

module.exports = { bus };