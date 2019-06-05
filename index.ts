import express = require('express');
import session = require('express-session');
import bodyParser = require('body-parser');
import connectMongo = require('connect-mongo');

import { QRCodeGenerator } from "./src/qrcode-generation/qrcode-generator";
import { RedirectionService } from "./src/redirection/redirection-service";
import { fillEventStoreWithDemoEvents } from "./demo-events";
import { Configuration } from "./src/configuration";
import { EventStore } from './src/events/event-store';
import { MongoDBStorageAdapter } from './src/events/adapters/mongodb-adapter';
import { MemoryStorageAdapter } from './src/events/adapters/memory-adapter';
import { AccountService } from './src/accounts/account-service';
import { AccountType } from './src/accounts/account-type';
import { AppAuthProvider } from './src/accounts/auth-providers/app-auth-provider';
import { GoogleAuthProvider } from './src/accounts/auth-providers/google-auth-provider';
import { ExpressSessionProvider } from './src/sessions/express-session-provider';

const configuration = Configuration.read("./config.json");
const port = process.env.PORT || configuration.fallbackPort;

getEventStoreByConfiguration(configuration).then(eventStore => {
    setupApp(configuration, eventStore);
});

function setupApp(configuration: Configuration, eventStore: EventStore) {
    const app = express();

    // Public static files.
    app.use(express.static(__dirname + '/public'));

    // Parse body of POST requests.
    app.use(bodyParser.json());

    // Configure express-session.
    app.use(session({
        secret: configuration.session.secret,
        proxy: true,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: configuration.session.requireHttps,
            secure: configuration.session.requireHttps
        },
        store: getSessionStoreByConfiguration(configuration)
    }));

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
        try {
            const sessionProvider = new ExpressSessionProvider(req);
            const redirectionService = new RedirectionService(sessionProvider, eventStore);
            
            const redirectionTarget = await redirectionService.followRedirection(req.params.id, {
                from: <string>req.headers["x-forwarded-for"] || req.connection.remoteAddress,
                userAgent: req.headers["user-agent"]
            });

            res.writeHead(302, { Location: redirectionTarget });
            res.end();
        }
        catch (error) {
            res.statusCode = 500;
            res.send(error.toString());
        }
    });

    app.post('/signin/:type', async (req, res) => {
        const sessionProvider = new ExpressSessionProvider(req);
        const accountService = new AccountService(sessionProvider, eventStore, {
            [AccountType.App]: new AppAuthProvider(),
            [AccountType.Google]: new GoogleAuthProvider(configuration.google.authClientId)
        });

        await accountService.signIn(req.params.type, req.body);

        const success = !!sessionProvider.getCurrentAccountId();
        res.send(success);
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

function getSessionStoreByConfiguration(configuration: Configuration): session.MemoryStore | session.Store {
    const sessionStoreConfig = configuration.session.store;
    const providedConfigCount = [sessionStoreConfig.memory, sessionStoreConfig.mongo].filter(x => !!x).length;

    if (providedConfigCount !== 1) {
        throw new Error('Invalid configuration: You need to provide exactly one storage adapter for the session store.');
    }

    if (sessionStoreConfig.memory) {
        return new session.MemoryStore();
    } else if (sessionStoreConfig.mongo) {
        const MongoStore = connectMongo(session);
        return new MongoStore({
            url: sessionStoreConfig.mongo.url,
            autoRemove: 'interval',
            autoRemoveInterval: 10
        });
    }
}