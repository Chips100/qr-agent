import { Event } from "./event";
import { EventFilter } from "./event-filter";

/**
 * Adapter that allows persistent storage of events.
 */
export interface StorageAdapter {
    /**
     * Stores the specified event.
     * @param event Event that should be stored.
     */
    storeEvent(event: Event): Promise<void>;

    /**
     * Reads events from the store that match the specified filter.
     * Events will always be returned in chronologically descending order.
     * @param filter Mask-like filter matched by comparing property values for equality.
     * @param limit Maximum number of events that should be returned.
     */
    readEvents(filter: EventFilter, limit: number): Promise<Event[]>;
}