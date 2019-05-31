import { Event } from './src/events/event';
import { RedirectionConfiguredEvent } from "./src/redirection/redirection-configured.event";
import { MemoryStorageAdapter } from "./src/events/adapters/memory-adapter";
import { EventStore } from "./src/events/event-store";

/**
 * Creates an EventStore that is initially filled with some demo events.
 */
export function getDemoEventStore(): EventStore {
    const storageAdapter = new MemoryStorageAdapter();
    const eventStore = new EventStore(storageAdapter);

    // Add each demo event individually.
    for (let event of getDemoEvents()) {
        storageAdapter.storeEvent(event);
    }

    return eventStore;
}

function getDemoEvents(): Event[] {
    return [
        createEvent(RedirectionConfiguredEvent, new Date(2019, 4, 30), { id: 1, targetUrl: 'https://www.google.com/' }),
        createEvent(RedirectionConfiguredEvent, new Date(2019, 4, 30), { id: 2, targetUrl: 'https://www.facebook.com/' }),
        createEvent(RedirectionConfiguredEvent, new Date(2019, 4, 30), { id: 3, targetUrl: 'https://www.amazon.com/' }),
        createEvent(RedirectionConfiguredEvent, new Date(2019, 4, 29), { id: 1, targetUrl: 'https://www.netflix.com/' })
    ];
}

function createEvent<T extends Event>(eventType: { new() : T }, timestamp: Date, data: any): T {
    // Use default constructor for automatic retreival of the event's type name.
    const event = new eventType();
    Object.assign(event, data);
    event.timestamp = timestamp;

    return event;
}