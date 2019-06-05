import { AuthProvider } from "../auth-provider";
import { VerifyClaimResult } from "../verify-claim-result";
import auth = require('google-auth-library');

/**
 * Provider that checks authentication attempts with Google accounts.
 */
export class GoogleAuthProvider implements AuthProvider {
  private readonly _client: auth.OAuth2Client;

  /**
   * Creates a GoogleAuthProvider.
   * @param googleClientId Client ID registered for signing in with Google accounts.
   */
  public constructor(private googleClientId: string) {
    this._client = new auth.OAuth2Client(googleClientId);
  }
  
  /**
   * Verifies the provided claim for signin in with an account.
   * @param payload Payload that is used to proof the auth claim.
   */
  public async verifyClaim(payload: {token: string}): Promise<VerifyClaimResult> {
    try {
      const ticket = await this._client.verifyIdToken({
        idToken: payload.token,
        audience: this.googleClientId
      });
      
      const ticketPayload = ticket.getPayload();
      
      return {
        verified: true, 
        accountId: ticketPayload.sub, 
        authProviderInformation: ticketPayload 
      };
    }
    catch(error) {
      // TODO: Logging
      return { verified: false, accountId: null };
    }
  }
}