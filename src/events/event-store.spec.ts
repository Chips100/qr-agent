import { Event } from "./event";
import { EventStore } from "./event-store";
import { MemoryStorageAdapter } from "./adapters/memory-adapter";

describe('EventStore', () => {
    it('should store events by forwarding to the storage adapter', async () => {
        const adapter = new MemoryStorageAdapter();
        const sut = new EventStore(adapter);

        const event = new TestEvent("Hello, World!", 42);
        await sut.storeEvent(event);

        expect(adapter.getAllEvents()).toEqual([event]);
    });

    it('should query events of a type by extending the filter accordingly', async () => {
        const adapter = new MemoryStorageAdapter();
        const sut = new EventStore(adapter);

        // Make TestEvent the later one, but it should not
        // be returned when querying TestEvent2.
        const event1 = new TestEvent("Hello, World!", 42);
        const event2 = new TestEvent2();
        event1.timestamp = new Date(2019, 2, 1);
        event2.timestamp = new Date(2019, 1, 1);

        sut.storeEvent(event1);
        sut.storeEvent(event2);

        const event = await sut.getLatestOfType(TestEvent2, {});
        expect(event).toEqual(event2);
    });
});

class TestEvent extends Event {
    public constructor(
        public stringValue: string,
        public numberValue: number
    ) { super(); }

    protected getEventTypeName(): string { return "Test"; }
}

class TestEvent2 extends Event {
    protected getEventTypeName(): string { return "Test2"; }
}