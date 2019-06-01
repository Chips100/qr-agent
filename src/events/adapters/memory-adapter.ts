import { StorageAdapter } from "../storage-adapter";
import { Event } from "../event";
import { EventFilter } from "../event-filter";

/**
 * Storage adapter that keeps events in memory (non-persistent).
 */
export class MemoryStorageAdapter implements StorageAdapter {
    private readonly _events: Event[] = [];

    /**
     * Stores the specified event.
     * @param event Event that should be stored.
     */
    public async storeEvent(event: Event): Promise<void> {
        // Sort events in chronologically descending order for faster reads.
        this._events.push(event);
        this._events.sort((a, b) => { return +b.timestamp - +a.timestamp })
    }    
    
    /**
     * Reads events from the store that match the specified filter.
     * Events will always be returned in chronologically descending order.
     * @param filter Mask-like filter matched by comparing property values for equality.
     * @param limit Maximum number of events that should be returned.
     */
    public async readEvents(filter: EventFilter, limit: number): Promise<Event[]> {
        return this._events.filter(e => this.matches(e, filter)).slice(0, limit);
    }

    /**
     * Retreives all events stored in memory.
     * Main purpose for inspecting contents in unit tests.
     */
    public getAllEvents(): Event[] {
        return this._events.slice(0);
    }

    /**
     * Determines if the specified event matches the filter.
     */
    private matches(event: Event, filter: EventFilter) {
        for(let key of Object.keys(filter)) {
            if ((<any>event)[key] !== filter[key]) {
                return false;
            }
        }

        return true;
    }
}