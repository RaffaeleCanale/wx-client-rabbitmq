import { getLogger } from 'js-utils/logger';

export default class {

    constructor(channel, queueName) {
        this.channel = channel;
        this.queueName = queueName;
        this.logger = getLogger(`rabbitmq.queue:${this.queueName}`);
    }

    init() {
        return this.channel.assertQueue(this.queueName, { durable: true })
            .then(() => {
                this.logger.verbose('Durable channel initialized');
                return this;
            });
    }

    send(message) {
        this.channel.sendToQueue(this.queueName, Buffer.from(message), {
            persistent: true,
        });
        this.logger.verbose('Message sent:', message);
    }

    receive(consumer) {
        this.logger.verbose('Waiting for messages...');
        this.channel.consume(this.queueName, consumer, { noAck: false });
    }

}
