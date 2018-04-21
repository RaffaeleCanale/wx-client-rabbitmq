'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = listen;

var _fileUtils = require('js-utils/file-utils');

var _rabbitFactory = require('./rabbitFactory');

var _rabbitFactory2 = _interopRequireDefault(_rabbitFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function listen(configFile, consumer, options) {
    var trigger = options.trigger,
        _options$message = options.message,
        message = _options$message === undefined ? {} : _options$message;

    if (trigger) {
        return Promise.resolve(consumer(message, trigger));
    }

    var factory = void 0;
    var exchange = void 0;
    var bindings = void 0;

    return (0, _fileUtils.readJson)(configFile).then(function (config) {
        return _.assign(config, options);
    }).then(function (config) {
        factory = new _rabbitFactory2.default(config);
        bindings = config.bindings;
        exchange = config.exchange;
        return factory.connect();
    }).then(function () {
        return factory.getBroadcastReceiver(exchange, bindings);
    }).then(function (ch) {
        return ch.consume(consumer);
    });
}