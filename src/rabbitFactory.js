import amqp from 'amqplib';
import Joi from 'joi';
import Logger from 'js-utils/logger';
import DurableChannel from './_internal/durableChannel';
import BroadcastEmitter from './_internal/broadcastEmitter';
import BroadcastReceiver from './_internal/broadcastReceiver';


const configSchema = Joi.object().keys({
    protocol: Joi.string().default('amqp'),
    hostname: Joi.string().hostname().required(),
    port: Joi.number().integer().positive().default(5672),
    username: Joi.string().required(),
    password: Joi.string().required(),
}).required();

function validateConfig(config) {
    const result = Joi.validate(config, configSchema);
    if (result.error) {
        throw result.error;
    }

    return result.value;
}

export default class {

    constructor(config) {
        this.config = validateConfig(config);
    }

    connect() {
        return amqp.connect(this.config).then((conn) => {
            this.connection = conn;
            Logger.info('Connected to', this.config.hostname);
        });
    }

    getDurableChannel(queueName) {
        this._ensureIsConnected();

        return this.connection.createChannel()
            .then(ch => new DurableChannel(ch, queueName).init());
    }

    getBroadcastEmitter(exchangeName) {
        this._ensureIsConnected();

        return this.connection.createChannel()
            .then(ch => new BroadcastEmitter(ch, exchangeName).init());
    }

    getBroadcastReceiver(exchangeName, bindings) {
        this._ensureIsConnected();

        return this.connection.createChannel()
            .then(ch => new BroadcastReceiver(ch, exchangeName, bindings).init());
    }

    close() {
        this._ensureIsConnected();
        return this.connection.close()
            .finally(() => {
                this.connection = null;
            });
    }

    _ensureIsConnected() {
        if (!this.connection) {
            throw Error('Must connect first');
        }
    }

}
