const EventEmitter = require('events');
class MyEmitter extends EventEmitter {}
const paymentEmitter = new MyEmitter();

module.exports = paymentEmitter;
