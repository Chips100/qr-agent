import { event, Event } from "../events/event";

/**
 * Event representing the configuration of a redirect for a QR code.
 */
@event('RedirectionConfigured')
export class RedirectionConfiguredEvent extends Event {
    /**
     * ID of the QR code that is configured.
     */
    id: string;

    /**
     * Target URL that should be redirected to when visiting the QR code.
     */
    targetUrl: string;
}