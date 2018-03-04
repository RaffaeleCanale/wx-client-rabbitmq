import { getLogger } from 'js-utils/logger';
import { contains } from 'js-utils/utils';

export default class {

    constructor(channel, exchangeName, bindings = []) {
        this.channel = channel;
        this.exchangeName = exchangeName;
        this.bindings = bindings;
        this.isInit = false;
        this.logger = getLogger(() => this._name);

        // Always listen for the default binding
        if (!contains(this.bindings, 'all')) {
            this.bindings.push('all');
        }
    }

    get _name() {
        return this.isInit ? `EX:${this.exchangeName}` : '<uninitialized>';
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
                this.logger.verbose('Bindings:', this.bindings);
                return this;
            });
    }

    consume(consumer) {
        this._ensureIsInit();

        this.logger.info('Waiting for messages...');
        this.channel.consume(this.q.queue, (msg) => {
            try {
                const message = JSON.parse(msg.content);
                this.logger.info('Message received:', message);
                return consumer(message);
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
