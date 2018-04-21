import { readJson } from 'js-utils/file-utils';

import RabbitFactory from './rabbitFactory';

export default function listen(configFile, consumer, options) {
    const { trigger, message = {} } = options;
    if (trigger) {
        return Promise.resolve(consumer(message, trigger));
    }

    let factory;
    let exchange;
    let bindings;

    return readJson(configFile)
        .then(config => _.assign(config, options))
        .then((config) => {
            factory = new RabbitFactory(config);
            bindings = config.bindings;
            exchange = config.exchange;
            return factory.connect();
        })
        .then(() => factory.getBroadcastReceiver(exchange, bindings))
        .then(ch => ch.consume(consumer));
}
