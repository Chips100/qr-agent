import { event, Event } from "../events/event";

/**
 * Event representing the usage of a redirect for a QR code.
 */
@event('RedirectionVisited')
export class RedirectionVisitedEvent extends Event {
    /**
     * ID of the QR code that has been visited.
     */
    id: string;

    /**
     * Address of the visitor (i.e. the IP address).
     */
    from: string;

    /**
     * User agent string provided by the visitor.
     */
    userAgent: string;
}