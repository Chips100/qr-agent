import { AuthProvider } from "../auth-provider";
import { VerifyClaimResult } from "../verify-claim-result";

/**
 * Provider that authenticates accounts registered in-app with username + password.
 */
export class AppAuthProvider implements AuthProvider {
  /**
   * Verifies the provided claim for signin in with an account.
   * @param payload Payload that is used to proof the auth claim.
   */
  public async verifyClaim(payload: any): Promise<VerifyClaimResult> {
    // Not implemented yet.
    return { verified: false, accountId: null };
  }
}