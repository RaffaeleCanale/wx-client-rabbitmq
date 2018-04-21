'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _amqplib = require('amqplib');

var _amqplib2 = _interopRequireDefault(_amqplib);

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

var _logger = require('js-utils/logger');

var _durableChannel = require('./_internal/durableChannel');

var _durableChannel2 = _interopRequireDefault(_durableChannel);

var _broadcastEmitter = require('./_internal/broadcastEmitter');

var _broadcastEmitter2 = _interopRequireDefault(_broadcastEmitter);

var _broadcastReceiver = require('./_internal/broadcastReceiver');

var _broadcastReceiver2 = _interopRequireDefault(_broadcastReceiver);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Logger = (0, _logger.getLogger)('rabbitmq.factory');
var configSchema = _joi2.default.object().keys({
    protocol: _joi2.default.string().default('amqp'),
    hostname: _joi2.default.string().hostname().required(),
    port: _joi2.default.number().integer().positive().default(5672),
    username: _joi2.default.string().required(),
    password: _joi2.default.string().required()
}).unknown().required();

function validateConfig(config) {
    var result = _joi2.default.validate(config, configSchema);
    if (result.error) {
        throw result.error;
    }

    return result.value;
}

var _class = function () {
    function _class(config) {
        _classCallCheck(this, _class);

        this.config = validateConfig(config);
    }

    _createClass(_class, [{
        key: 'connect',
        value: function connect() {
            var _this = this;

            return _amqplib2.default.connect(this.config).then(function (conn) {
                _this.connection = conn;
                Logger.info('Connected to', _this.config.hostname);
            });
        }
    }, {
        key: 'getDurableChannel',
        value: function getDurableChannel(queueName) {
            this._ensureIsConnected();

            return this.connection.createChannel().then(function (ch) {
                return new _durableChannel2.default(ch, queueName).init();
            });
        }
    }, {
        key: 'getBroadcastEmitter',
        value: function getBroadcastEmitter(exchangeName) {
            this._ensureIsConnected();

            return this.connection.createChannel().then(function (ch) {
                return new _broadcastEmitter2.default(ch, exchangeName).init();
            });
        }
    }, {
        key: 'getBroadcastReceiver',
        value: function getBroadcastReceiver(exchangeName, bindings) {
            this._ensureIsConnected();

            return this.connection.createChannel().then(function (ch) {
                return new _broadcastReceiver2.default(ch, exchangeName, bindings).init();
            });
        }
    }, {
        key: 'close',
        value: function close() {
            var _this2 = this;

            this._ensureIsConnected();
            return this.connection.close().finally(function () {
                _this2.connection = null;
            });
        }
    }, {
        key: '_ensureIsConnected',
        value: function _ensureIsConnected() {
            if (!this.connection) {
                throw Error('Must connect first');
            }
        }
    }]);

    return _class;
}();

exports.default = _class;