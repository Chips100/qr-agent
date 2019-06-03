import { Event } from './src/events/event';
import { RedirectionConfiguredEvent } from "./src/redirection/redirection-configured.event";
import { EventStore } from "./src/events/event-store";

/**
 * Puts demo events into the specified EventStore.
 */
export async function fillEventStoreWithDemoEvents(eventStore: EventStore): Promise<void> {
    // Add each demo event individually.
    for (let event of getDemoEvents()) {
        await eventStore.storeEvent(event);
    }
}

function getDemoEvents(): Event[] {
    return [
        createEvent(RedirectionConfiguredEvent, new Date(2019, 4, 30), { id: "1", targetUrl: 'https://www.google.com/' }),
        createEvent(RedirectionConfiguredEvent, new Date(2019, 4, 30), { id: "2", targetUrl: 'https://www.facebook.com/' }),
        createEvent(RedirectionConfiguredEvent, new Date(2019, 4, 30), { id: "3", targetUrl: 'https://www.amazon.com/' }),
        createEvent(RedirectionConfiguredEvent, new Date(2019, 4, 29), { id: "1", targetUrl: 'https://www.netflix.com/' })
    ];
}

function createEvent<T extends Event>(eventType: { new() : T }, timestamp: Date, data: any): T {
    // Use default constructor for automatic retreival of the event's type name.
    const event = new eventType();
    Object.assign(event, data);
    event.timestamp = timestamp;

    return event;
}