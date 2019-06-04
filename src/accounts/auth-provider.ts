import { VerifyClaimResult } from "./verify-claim-result";

/**
 * Adapter for authentication with different auth providers.
 */
export interface AuthProvider {
  /**
   * Verifies the provided claim for signin in with an account.
   * @param payload Payload that is used to proof the auth claim.
   */
  verifyClaim(payload: any): Promise<VerifyClaimResult>;
}