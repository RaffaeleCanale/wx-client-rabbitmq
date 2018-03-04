import { getLogger } from 'js-utils/logger';

export default class {

    constructor(channel, exchangeName, bindings = []) {
        this.channel = channel;
        this.exchangeName = exchangeName;
        if (bindings.length === 0) {
            this.bindings = ['all.*'];
        } else {
            this.bindings = bindings.map(b => `all.${b}`);
        }
        this.isInit = false;
        this.logger = getLogger(() => this._name);
    }

    get _name() {
        const name = this.isInit ? `${this.exchangeName}@${this.bindings}` : 'unitinialized';
        return `rabbitmq.receiver<${name}>`;
    }

    init() {
        return this.channel.assertExchange(this.exchangeName, 'topic', { durable: false })
            .then(() => this.channel.assertQueue('', { exclusive: true }))
            .then((q) => {
                this.q = q;
                return Promise.all(this.bindings.map(b =>
                    this.channel.bindQueue(q.queue, this.exchangeName, b)));
            })
            .then(() => {
                this.isInit = true;
                this.logger.verbose('Broadcast receiver initialized:', this.q.queue);
                return this;
            });
    }

    consume(consumer) {
        this._ensureIsInit();

        this.logger.verbose('Waiting for messages...');
        this.channel.consume(this.q.queue, (msg) => {
            try {
                const message = JSON.parse(msg.content);
                this.logger.verbose('Message received:', message);
                return consumer(message, msg.fields.routingKey);
            } catch (err) {
                return this.logger.error('Failed to parse JSON message', err);
            }
        }, { noAck: true });
    }

    _ensureIsInit() {
        if (!this.isInit) {
            throw new Error('Must init first');
        }
    }
}
