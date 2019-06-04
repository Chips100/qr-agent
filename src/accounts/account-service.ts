import { AccountType } from "./account-type";
import { EventStore } from "../events/event-store";
import { AccountCreatedEvent } from "./account-created.event";
import { VerifyClaimResult } from "./verify-claim-result";
import { AuthProvider } from "./auth-provider";

/**
 * Allows management of accounts with authentication checks.
 */
export class AccountService {
  /**
   * Creates an AccountService.
   * @param eventStore EventStore used to access and create events.
   * @param adapters Adapters for authenticating with different auth providers.
   */
  public constructor(
    private eventStore: EventStore,
    private adapters: { [key in AccountType]: AuthProvider }) { }

  /**
   * Signs into an account; creates an account automatically on first
   * sign in with authentication via an external provider (e.g. Google).
   * @param accountType Type of the account to use for signing in.
   * @param payload Payload that is used to proof the auth claim.
   */
  public async signIn(accountType: AccountType, payload: any): Promise<VerifyClaimResult> {
    const adapter = this.adapters[accountType];
    const verifiedClaim = await adapter.verifyClaim(payload);

    // Early exit if underlying auth provider could not verify the claim.
    if (!verifiedClaim.verified) { return { verified: false, accountId: null }; }

    // Qualify the internal account id by prefixing the auth provider.
    const qualifiedAccountId = `${accountType}:${verifiedClaim.accountId}`;

    // Create account for first sign in with an external auth provider.
    await this.createAccountIfNotExists(qualifiedAccountId);
    return { verified: true, accountId: qualifiedAccountId };
  }

  /**
   * Creates a new account if one does not exist for the specified id.
   * @param qualifiedAccountId Fully qualified id of the account.
   */
  private async createAccountIfNotExists(qualifiedAccountId: string): Promise<void> {
    const creationEvent = await this.eventStore.getLatestOfType(AccountCreatedEvent, { 
      id: qualifiedAccountId 
    });
    
    if (!creationEvent) {
      const newCreatedEvent = new AccountCreatedEvent();
      newCreatedEvent.id = qualifiedAccountId;
      await this.eventStore.storeEvent(newCreatedEvent);
    }
  }
}