import { MemoryStorageAdapter } from "../events/adapters/memory-adapter";
import { RedirectionService } from "./redirection-service";
import { EventStore } from "../events/event-store";
import { RedirectionConfiguredEvent } from "./redirection-configured.event";
import { RedirectionVisitedEvent } from "./redirection-visited.event";
import { TransientSessionProvider } from "../sessions/transient-session-provider";

describe('RedirectionService', () => {
    it('should configure a redirection by storing the according event', async () => {
        const adapter = new MemoryStorageAdapter();
        const sessionProvider = new TransientSessionProvider();
        const sut = new RedirectionService(sessionProvider, new EventStore(adapter));

        sessionProvider.signIn("app:account");
        await sut.configureRedirection("ID", "https://www.google.com/");

        const events = adapter.getAllEvents();
        expect(events.length).toEqual(1);
        expect(events[0] instanceof RedirectionConfiguredEvent).toBeTruthy();

        const event = <RedirectionConfiguredEvent>events[0];
        expect(event.id).toEqual("ID");
        expect(event.accountId).toEqual("app:account");
        expect(event.targetUrl).toEqual("https://www.google.com/");
    });

    it('should check the ownership of the QR code if it has been used before', async () => {
        const adapter = new MemoryStorageAdapter();
        const sessionProvider = new TransientSessionProvider();
        const sut = new RedirectionService(sessionProvider, new EventStore(adapter));

        // Previous configuration by different account.
        const existingEvent = new RedirectionConfiguredEvent();
        existingEvent.id = "ID";
        existingEvent.accountId = "app:otheraccount";
        adapter.storeEvent(existingEvent);

        sessionProvider.signIn("app:account");
        expect(sut.configureRedirection("ID", "https://www.google.com/"))
            .rejects.toEqual(new Error('QR code is already in use.'));
    });

    it('should allow reconfiguration of a QR code if it was previously configured by the same account', async () => {
        const adapter = new MemoryStorageAdapter();
        const sessionProvider = new TransientSessionProvider();
        const sut = new RedirectionService(sessionProvider, new EventStore(adapter));

        // Previous configuration by same account as below.
        const existingEvent = new RedirectionConfiguredEvent();
        existingEvent.id = "ID";
        existingEvent.accountId = "app:account";
        existingEvent.timestamp = new Date(2019, 0, 1);
        adapter.storeEvent(existingEvent);

        // Reconfigure the QR code with the same id.
        sessionProvider.signIn("app:account");
        await sut.configureRedirection("ID", "https://www.google.com/");

        // Check for new configuration event.
        const events = adapter.getAllEvents();
        expect(events.length).toEqual(2);
        expect(events[0] instanceof RedirectionConfiguredEvent).toBeTruthy();

        const event = <RedirectionConfiguredEvent>events[0];
        expect(event.id).toEqual("ID");
        expect(event.accountId).toEqual("app:account");
        expect(event.targetUrl).toEqual("https://www.google.com/");
    });

    it('should follow a redirection by retreiving the latest configuration and storing the visit as an event', async () => {
        const adapter = new MemoryStorageAdapter();
        const sut = new RedirectionService(new TransientSessionProvider(), new EventStore(adapter));

        adapter.storeEvent(createConfiguredEvent("ID", "https://www.google.com/old", new Date(2019, 2, 1)));
        adapter.storeEvent(createConfiguredEvent("ID", "https://www.google.com/new", new Date(2019, 3, 1)));
        adapter.storeEvent(createConfiguredEvent("ID", "https://www.google.com/old", new Date(2019, 1, 1)));

        // Check redirection to correct url.
        const url = await sut.followRedirection("ID", { from: "localhost", userAgent: "user-agent" });
        expect(url).toEqual("https://www.google.com/new");

        // Check visited event.
        const visitedEvent = <RedirectionVisitedEvent>adapter.getAllEvents().find(x => x instanceof RedirectionVisitedEvent);
        expect(visitedEvent).toBeTruthy();
        expect(visitedEvent.id).toEqual("ID");
        expect(visitedEvent.from).toEqual("localhost");
        expect(visitedEvent.userAgent).toEqual("user-agent");

        function createConfiguredEvent(id: string, url: string, timestamp: Date) {
            const event = new RedirectionConfiguredEvent();
            event.id = id;
            event.targetUrl = url;
            event.timestamp = timestamp;
            return event;
        }
    });
});