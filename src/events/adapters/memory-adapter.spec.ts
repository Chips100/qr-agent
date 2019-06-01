import { MemoryStorageAdapter } from './memory-adapter';
import { Event } from '../event';

describe('MemoryStorageAdapter', () => {
    it('should store and return a single event', async () => {
        const sut = new MemoryStorageAdapter();
        const event = new TestEvent("Hello, World!", 42);
        sut.storeEvent(event);
    
        const events = await sut.readEvents({}, Infinity);
        expect(events).toEqual([event]);
    });

    it('should apply the specified filter when reading events', async () => {
        const sut = new MemoryStorageAdapter();
        const event1 = new TestEvent("Hello, World!", 42);
        const event2 = new TestEvent("Does not match", 42);
        const event3 = new TestEvent("Hello, World!", 43);
        sut.storeEvent(event1);
        sut.storeEvent(event2);
        sut.storeEvent(event3);
    
        const events = await sut.readEvents({ stringValue: "Hello, World!", numberValue: 42 }, Infinity);
        expect(events).toEqual([event1]);
    });

    it('should only return the specified number of events (limit)', async () => {
        const sut = new MemoryStorageAdapter();
        const event1 = new TestEvent("Hello, World!", 42);
        const event2 = new TestEvent("Hello, World!", 42);
        const event3 = new TestEvent("Hello, World!", 42);
        sut.storeEvent(event1);
        sut.storeEvent(event2);
        sut.storeEvent(event3);
    
        const events = await sut.readEvents({ stringValue: "Hello, World!", numberValue: 42 }, 2);
        expect(events.length).toEqual(2);
    });

    it('should keep the events in chronologically descending order', async () => {
        const sut = new MemoryStorageAdapter();
        const event1 = new TestEvent("Hello, World!", 42);
        const event2 = new TestEvent("Hello, World!", 42);
        const event3 = new TestEvent("Hello, World!", 42);

        // Mix timestamps.
        event1.timestamp = new Date(2019, 2, 1);
        event2.timestamp = new Date(2019, 3, 1);
        event3.timestamp = new Date(2019, 1, 1);
        sut.storeEvent(event1);
        sut.storeEvent(event2);
        sut.storeEvent(event3);

        // Check chronologically descending order.
        const events = await sut.readEvents({}, Infinity);
        expect(events).toEqual([event2, event1, event3]);
    });
});

class TestEvent extends Event {
    public constructor(
        public stringValue: string,
        public numberValue: number
    ) { super(); }

    protected getEventTypeName(): string { return "Test"; }
}