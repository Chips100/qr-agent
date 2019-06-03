import express = require('express');

import { QRCodeGenerator } from "./src/qrcode-generation/qrcode-generator";
import { RedirectionService } from "./src/redirection/redirection-service";
import { fillEventStoreWithDemoEvents } from "./demo-events";
import { Configuration } from "./src/configuration";
import { EventStore } from './src/events/event-store';
import { MongoDBStorageAdapter } from './src/events/adapters/mongodb-adapter';
import { MemoryStorageAdapter } from './src/events/adapters/memory-adapter';

const configuration = Configuration.read("./config.json");
const port = process.env.PORT || configuration.fallbackPort;

getEventStoreByConfiguration(configuration).then(eventStore => {
    setupApp(configuration, eventStore);
});

function setupApp(configuration: Configuration, eventStore: EventStore) {
    const app = express();
    
    // Generate QR-codes.
    app.get('/qrcode/:id', async (req, res) => {
        const generator = new QRCodeGenerator();
        const svg = await generator.createSvg(
            configuration.publicDomain + 
            configuration.visitPrefix + 
            req.params.id);
    
        const redirectionService = new RedirectionService(eventStore);
        await redirectionService.configureRedirection(req.params.id, "https://dennis-janiak.de");

        res.setHeader('Content-type', 'image/svg+xml');
        res.send(svg);
    });
    
    // Visit QR-codes.
    app.get(`/${configuration.visitPrefix}:id`, async (req, res) => {
        try {
            const redirectionService = new RedirectionService(eventStore);
            const redirectionTarget = await redirectionService.followRedirection(req.params.id, {
                from: <string>req.headers["x-forwarded-for"] || req.connection.remoteAddress,
                userAgent: req.headers["user-agent"]
            });
    
            res.writeHead(302, { Location: redirectionTarget });
            res.end();
        }
        catch(error) {
            res.statusCode = 500;
            res.send(error.toString());
        }
    });
    
    
    app.listen(port, () => {
        console.log(`Listening on port ${port}!`);
    });
}

async function getEventStoreByConfiguration(configuration: Configuration): Promise<EventStore> {
    const eventStoreConfig = configuration.eventStore;
    const providedConfigCount = [eventStoreConfig.memory, eventStoreConfig.mongo].filter(x => !!x).length;
    let eventStore: EventStore = null;

    if (providedConfigCount !== 1) {
        throw new Error('Invalid configuration: You need to provide exactly one storage adapter for the event store.');
    }

    if (eventStoreConfig.memory) {
        eventStore = new EventStore(new MemoryStorageAdapter());
    } else if (eventStoreConfig.mongo) {
        eventStore = new EventStore(new MongoDBStorageAdapter(eventStoreConfig.mongo.url));
    }

    if (eventStoreConfig.fillWithDemoEvents) {
        fillEventStoreWithDemoEvents(eventStore);
    }
    
    return eventStore;
}