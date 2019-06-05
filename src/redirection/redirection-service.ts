import { EventStore } from "../events/event-store";
import { RedirectionConfiguredEvent } from "./redirection-configured.event";
import { RedirectionVisitedEvent } from "./redirection-visited.event";
import { SessionProvider } from "../sessions/session-provider";

/**
 * Allows configuration and lookup of redirections for QR codes.
 */
export class RedirectionService {
    /**
     * Creates a RedirectionService.
     * @param sessionprovider Provider used to access data stored in the current user session.
     * @param eventStore EventStore used to access and create events.
     */
    public constructor(
        private readonly sessionProvider: SessionProvider,
        private readonly eventStore: EventStore) { }

    /**
     * Configures the redirection for the specified QR code.
     * @param id ID of the QR code that should be redirected.
     * @param targetUrl URL that visitors of the QR code should be redirected to.
     */
    public async configureRedirection(id: string, targetUrl: string): Promise<void> {
        const currentAccountId = this.sessionProvider.getCurrentAccountId();
        const lastConfigurationEvent = await this.eventStore.getLatestOfType(RedirectionConfiguredEvent, {
            id: id
        });

        // Check ownership of the QR code with the specified id.
        if (lastConfigurationEvent && lastConfigurationEvent.accountId !== currentAccountId) {
            throw new Error('QR code is already in use.');
        }
        
        // (Re)configure the redirection by creating a new event.
        const event = new RedirectionConfiguredEvent();
        event.id = id;
        event.accountId = currentAccountId;
        event.targetUrl = targetUrl;
        await this.eventStore.storeEvent(event);
    }

    /**
     * Follows the redirection configured for the specified QR code.
     * @param id ID of the QR code that is being visited.
     * @param visitor Information about the visitor of the QR code.
     * @returns The target url that the visitor should be redirected to.
     */
    public async followRedirection(id: string, visitor: { from: string, userAgent: string }): Promise<string> {
        // Target Determined by the last configuration event.
        const configuredEvent = await this.eventStore.getLatestOfType(RedirectionConfiguredEvent, {
            id: id
        });
        
        // Create and store event for visit; fire-and-forget.
        const visitedEvent = new RedirectionVisitedEvent();
        visitedEvent.id = id;
        visitedEvent.from = visitor.from;
        visitedEvent.userAgent = visitor.userAgent;
        this.eventStore.storeEvent(visitedEvent);

        return configuredEvent.targetUrl;
    }
}