import express = require('express');

import { QRCodeGenerator } from "./src/qrcode-generation/qrcode-generator";
import { RedirectionService } from "./src/redirection/redirection-service";
import { fillEventStoreWithDemoEvents } from "./demo-events";
import { Configuration } from "./src/configuration";
import { EventStore } from './src/events/event-store';
import { MongoDBStorageAdapter } from './src/events/adapters/mongodb-adapter';

const configuration = Configuration.read("./config.json");
const port = process.env.PORT || configuration.fallbackPort;
const eventStore = new EventStore(new MongoDBStorageAdapter("mongodb://localhost:27017"));

fillEventStoreWithDemoEvents(eventStore).then(() => {
    const app = express();
    
    // Generate QR-codes.
    app.get('/qrcode/:id', async (req, res) => {
        const generator = new QRCodeGenerator();
        const svg = await generator.createSvg(
            configuration.publicDomain + 
            configuration.visitPrefix + 
            req.params.id);
    
        res.setHeader('Content-type', 'image/svg+xml');
        res.send(svg);
    });
    
    // Visit QR-codes.
    app.get(`/${configuration.visitPrefix}:id`, async (req, res) => {
        const redirectionService = new RedirectionService(eventStore);
        const redirectionTarget = await redirectionService.followRedirection(+req.params.id, {
            from: req.connection.remoteAddress,
            userAgent: req.headers["user-agent"]
        });
    
        res.writeHead(302, { Location: redirectionTarget });
        res.end();
    });
    
    
    app.listen(port, () => {
        console.log(`Listening on port ${port}!`);
    });
});