import { SessionProvider } from "./session-provider";

/**
 * SessionProvider that uses the express-session mechanism.
 */
export class ExpressSessionProvider implements SessionProvider {
    /**
     * Creates an ExpressSessionProvider for an express request.
     * @param request Request for which the session should be established.
     */
    public constructor(private readonly request: Express.Request) { }

    /**
     * Gets the id of the account signed into the current session; or null if not signed in.
     */
    public getCurrentAccountId(): string {
        return this.request.session.accountId;
    }

    /**
     * Sets the specified account to be signed into the current session.
     * @param accountId ID of the account that should be signed into the current session.
     */
    public signIn(accountId: string): void {
        this.request.session.accountId = accountId;
    }
}