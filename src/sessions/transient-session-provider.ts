import { SessionProvider } from "./session-provider";

/**
 * SessionProvider that only holds session data for the lifetime of the instance.
 * Main purpose for usage in unit tests.
 */
export class TransientSessionProvider implements SessionProvider {
    private accountId: string;

    /**
     * Gets the id of the account signed into the current session; or null if not signed in.
     */
    getCurrentAccountId(): string {
        return this.accountId;
    }    
        
    /**
     * Sets the specified account to be signed into the current session.
     * @param accountId ID of the account that should be signed into the current session.
     */
    signIn(accountId: string): void {
        this.accountId = accountId;
    }

    /**
     * Resets the session to be empty.
     */
    reset() {
        this.accountId = null;
    }
}