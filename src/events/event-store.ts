import { StorageAdapter } from "./storage-adapter";
import { EventFilter } from "./event-filter";
import { Event } from "./event";

/**
 * Stores and provides access to events.
 */
export class EventStore {
    /**
     * Creates an EventStore.
     * @param storage Storage adapter that should be used for persistent storage of events.
     */
    public constructor(private readonly storage: StorageAdapter) { }

    /**
     * Gets the latest event of the specified type that matches the filter.
     * @param type Type of events that should be searched.
     * @param filter Filter that should be matched by the returned event.
     */
    public async getLatestOfType<T extends Event>(type: {new(): T}, filter: EventFilter): Promise<T> {
        // Use default constructor for automatic retreival of the event's type name.
        const eventType = (new type()).type;
        const filterCopy = Object.assign({}, filter);
        filterCopy.type = eventType;

        return <T>(await this.storage.readEvents(filterCopy, 1))[0];
    }

    /**
     * Stores the specified event.
     * @param event Event that should be stored.
     */
    public storeEvent(event: Event): Promise<void> {
        // Just forward to the persistent storage.
        return this.storage.storeEvent(event);
    }
}