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
        const eventType = (new type()).type;
        const filterCopy = Object.assign({}, filter);
        filterCopy.type = eventType;

        return <T>(await this.storage.readEvents(filter, 1))[0];
    }
}