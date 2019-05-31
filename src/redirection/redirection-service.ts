import { EventStore } from "../events/event-store";
import { RedirectionConfiguredEvent } from "./redirection-configured.event";

/**
 * Allows configuration and lookup of redirections for QR codes.
 */
export class RedirectionService {
    /**
     * Creates a RedirectionService.
     * @param eventStore 
     */
    public constructor(private readonly eventStore: EventStore) { }

    /**
     * Gets the URL to which visitors of the specified QR Code should be redirected.
     * @param id ID of the QR Code.
     */
    public async getRedirectionById(id: number): Promise<string> {
        // Determined by the last configuration event.
        const event = await this.eventStore.getLatestOfType(RedirectionConfiguredEvent, {
            id: id
        });

        return event.targetUrl;
    }
}