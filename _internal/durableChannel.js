'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _logger = require('js-utils/logger');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
    function _class(channel, queueName) {
        _classCallCheck(this, _class);

        this.channel = channel;
        this.queueName = queueName;
        this.logger = (0, _logger.getLogger)('QE:' + this.queueName);
    }

    _createClass(_class, [{
        key: 'init',
        value: function init() {
            var _this = this;

            return this.channel.assertQueue(this.queueName, { durable: true }).then(function () {
                _this.logger.verbose('Durable channel initialized');
                return _this;
            });
        }
    }, {
        key: 'send',
        value: function send(message) {
            this.channel.sendToQueue(this.queueName, Buffer.from(message), {
                persistent: true
            });
            this.logger.info('Message sent:', message);
        }
    }, {
        key: 'receive',
        value: function receive(consumer) {
            this.logger.info('Waiting for messages...');
            this.channel.consume(this.queueName, consumer, { noAck: false });
        }
    }]);

    return _class;
}();

exports.default = _class;