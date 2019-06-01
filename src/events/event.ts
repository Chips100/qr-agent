/**
 * Base class for all events defined in the domain.
 */
export abstract class Event {
    /**
     * Creates an event.
     */
    public constructor() {
        this.type = this.getEventTypeName();
    }
    
    /**
     * Gets the name of the event's type.
     */
    public readonly type: string;
    
    /**
     * Timestamp of the event.
     */
    public timestamp: Date = new Date();

    /**
     * Can be overridden to specify how the event's type name should be retreived.
     * Default implementation looks for the event-decorator.
     */
    protected getEventTypeName(): string {
        return getEventDecorator((<any>this).__proto__.constructor).type;
    }
}

/**
 * Decorator for event definitions.
 * @param type Name of the event's type.
 */
export function event(type: string) {
    return function(decoratedType: any) {
        addEventDecorator(decoratedType, type);
    }
}


// Stores information supplied by the decorator in the type constructor.
function addEventDecorator(decoratedType: any, eventType: string) {
    decoratedType[EventDecoratorKey] = {
        type: eventType
    }
}

// Retreives information supplied by the decorator from the type constructor.
function getEventDecorator<T extends Event>(decoratedType: {new(): T}) {
    return (<any>decoratedType)[EventDecoratorKey];
}

const EventDecoratorKey = '__eventDecorator';