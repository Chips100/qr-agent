import { EventStore } from "../events/event-store";
import { RedirectionConfiguredEvent } from "./redirection-configured.event";
import { RedirectionVisitedEvent } from "./redirection-visited.event";

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
     * Follows the redirection configured for the specified QR code.
     * @param id ID of the QR code that is being visited.
     * @param visitor Information about the visitor of the QR code.
     * @returns The target url that the visitor should be redirected to.
     */
    public async followRedirection(id: number, visitor: { from: string, userAgent: string }): Promise<string> {
        // Target Determined by the last configuration event.
        const configuredEvent = await this.eventStore.getLatestOfType(RedirectionConfiguredEvent, {
            id: id
        });
        
        // Create and store event for visit; fire-and-forget.
        const visitedEvent = new RedirectionVisitedEvent();
        visitedEvent.from = visitor.from;
        visitedEvent.userAgent = visitor.userAgent;
        this.eventStore.storeEvent(visitedEvent);

        return configuredEvent.targetUrl;
    }
}