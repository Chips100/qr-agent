/**
 * Provides access to data stored in user sessions.
 */
export interface SessionProvider {
    /**
     * Gets the id of the account signed into the current session; or null if not signed in.
     */
    getCurrentAccountId(): string;

    /**
     * Sets the specified account to be signed into the current session.
     * @param accountId ID of the account that should be signed into the current session.
     */
    signIn(accountId: string): void;
}