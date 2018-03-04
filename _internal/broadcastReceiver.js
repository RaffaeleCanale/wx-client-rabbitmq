'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _logger = require('js-utils/logger');

var _utils = require('js-utils/utils');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
    function _class(channel, exchangeName) {
        var _this = this;

        var bindings = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

        _classCallCheck(this, _class);

        this.channel = channel;
        this.exchangeName = exchangeName;
        if (bindings.length === 0) {
            this.bindings = ['all.*'];
        } else {
            this.bindings = bindings.map(function (b) {
                return 'all.' + b;
            });
        }
        this.isInit = false;
        this.logger = (0, _logger.getLogger)(function () {
            return _this._name;
        });
    }

    _createClass(_class, [{
        key: 'init',
        value: function init() {
            var _this2 = this;

            return this.channel.assertExchange(this.exchangeName, 'topic', { durable: false }).then(function () {
                return _this2.channel.assertQueue('', { exclusive: true });
            }).then(function (q) {
                _this2.q = q;
                return Promise.all(_this2.bindings.map(function (b) {
                    return _this2.channel.bindQueue(q.queue, _this2.exchangeName, b);
                }));
            }).then(function () {
                _this2.isInit = true;
                _this2.logger.verbose('Broadcast receiver initialized:', _this2.q.queue);
                _this2.logger.verbose('Bindings:', _this2.bindings);
                return _this2;
            });
        }
    }, {
        key: 'consume',
        value: function consume(consumer) {
            var _this3 = this;

            this._ensureIsInit();

            this.logger.info('Waiting for messages...');
            this.channel.consume(this.q.queue, function (msg) {
                try {
                    var message = JSON.parse(msg.content);
                    _this3.logger.info('Message received:', message);
                    return consumer(message, msg.fields.routingKey);
                } catch (err) {
                    return _this3.logger.error('Failed to parse JSON message', err);
                }
            }, { noAck: true });
        }
    }, {
        key: '_ensureIsInit',
        value: function _ensureIsInit() {
            if (!this.isInit) {
                throw new Error('Must init first');
            }
        }
    }, {
        key: '_name',
        get: function get() {
            return this.isInit ? 'EX:' + this.exchangeName : '<uninitialized>';
        }
    }]);

    return _class;
}();

exports.default = _class;