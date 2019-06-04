/**
 * Result of a verification of an authentication claim.
 */
export interface VerifyClaimResult {
    /**
     * True, if the claim could be verified to be true.
     */
    verified: boolean;
  
    /**
     * ID of the account that was claimed.
     */
    accountId: string;
  }