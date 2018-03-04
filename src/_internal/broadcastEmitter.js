import { getLogger } from 'js-utils/logger';

export default class {

    constructor(channel, exchangeName) {
        this.exchangeName = exchangeName;
        this.channel = channel;
        this.logger = getLogger(() => this._name);
        this.isInit = false;
    }

    get _name() {
        return `rabbitmq.emitter<${this.isInit ? this.exchangeName : 'unitinialized'}>`;
    }

    init() {
        return this.channel.assertExchange(this.exchangeName, 'topic', { durable: false })
            .then(() => {
                this.isInit = true;
                this.logger.verbose('Broadcaster initialized');
                return this;
            });
    }

    emit(message, binding = '') {
        this._ensureIsInit();

        const extendedBinding = `all.${binding}`;
        this.channel.publish(
            this.exchangeName,
            extendedBinding,
            Buffer.from(JSON.stringify(message))
        );
        this.logger.verbose(`Message broadcasted@${extendedBinding}:`, message);
    }

    _ensureIsInit() {
        if (!this.isInit) {
            throw new Error('Must init first');
        }
    }

}
