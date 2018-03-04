'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _logger = require('js-utils/logger');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
    function _class(channel, exchangeName) {
        var _this = this;

        _classCallCheck(this, _class);

        this.exchangeName = exchangeName;
        this.channel = channel;
        this.logger = (0, _logger.getLogger)(function () {
            return _this._name;
        });
        this.isInit = false;
    }

    _createClass(_class, [{
        key: 'init',
        value: function init() {
            var _this2 = this;

            return this.channel.assertExchange(this.exchangeName, 'topic', { durable: false }).then(function () {
                _this2.isInit = true;
                _this2.logger.verbose('Broadcaster initialized');
                return _this2;
            });
        }
    }, {
        key: 'emit',
        value: function emit(message) {
            var binding = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

            this._ensureIsInit();

            var extendedBinding = 'all.' + binding;
            this.channel.publish(this.exchangeName, extendedBinding, Buffer.from(JSON.stringify(message)));
            this.logger.info('Message broadcasted@' + extendedBinding + ':', message);
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
            return this.isInit ? 'EX:' + this.exchangeName : '<unitinialized>';
        }
    }]);

    return _class;
}();

exports.default = _class;