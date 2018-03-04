import { getLogger } from 'js-utils/logger';

export default class {

    constructor(channel, exchangeName) {
        this.exchangeName = exchangeName;
        this.channel = channel;
        this.logger = getLogger(() => this._name);
        this.isInit = false;
    }

    get _name() {
        return this.isInit ? `EX:${this.exchangeName}` : '<unitinialized>';
    }

    init() {
        return this.channel.assertExchange(this.exchangeName, 'topic', { durable: false })
            .then(() => {
                this.isInit = true;
                this.logger.verbose('Broadcaster initialized');
                return this;
            });
    }

    emit(message, binding = 'all') {
        this._ensureIsInit();

        this.channel.publish(this.exchangeName, binding, Buffer.from(JSON.stringify(message)));
        this.logger.info(`Message broadcasted@${binding}:`, message);
    }

    _ensureIsInit() {
        if (!this.isInit) {
            throw new Error('Must init first');
        }
    }

}
