import { MemoryStorageAdapter } from "../events/adapters/memory-adapter";
import { RedirectionService } from "./redirection-service";
import { EventStore } from "../events/event-store";
import { RedirectionConfiguredEvent } from "./redirection-configured.event";
import { RedirectionVisitedEvent } from "./redirection-visited.event";

describe('RedirectionService', () => {
    it('should configure a redirection by storing the according event', async () => {
        const adapter = new MemoryStorageAdapter();
        const sut = new RedirectionService(new EventStore(adapter));

        await sut.configureRedirection(42, "https://www.google.com/");

        const events = adapter.getAllEvents();
        expect(events.length).toEqual(1);
        expect(events[0] instanceof RedirectionConfiguredEvent).toBeTruthy();

        const event = <RedirectionConfiguredEvent>events[0];
        expect(event.id).toEqual(42);
        expect(event.targetUrl).toEqual("https://www.google.com/");
    });

    it('should follow a redirection by retreiving the latest configuration and storing the visit as an event', async () => {
        const adapter = new MemoryStorageAdapter();
        const sut = new RedirectionService(new EventStore(adapter));

        adapter.storeEvent(createConfiguredEvent(42, "https://www.google.com/old", new Date(2019, 2, 1)));
        adapter.storeEvent(createConfiguredEvent(42, "https://www.google.com/new", new Date(2019, 3, 1)));
        adapter.storeEvent(createConfiguredEvent(42, "https://www.google.com/old", new Date(2019, 1, 1)));

        // Check redirection to correct url.
        const url = await sut.followRedirection(42, { from: "localhost", userAgent: "user-agent" });
        expect(url).toEqual("https://www.google.com/new");

        // Check visited event.
        const visitedEvent = <RedirectionVisitedEvent>adapter.getAllEvents().find(x => x instanceof RedirectionVisitedEvent);
        expect(visitedEvent).toBeTruthy();
        expect(visitedEvent.id).toEqual(42);
        expect(visitedEvent.from).toEqual("localhost");
        expect(visitedEvent.userAgent).toEqual("user-agent");

        function createConfiguredEvent(id: number, url: string, timestamp: Date) {
            const event = new RedirectionConfiguredEvent();
            event.id = id;
            event.targetUrl = url;
            event.timestamp = timestamp;
            return event;
        }
    });
});