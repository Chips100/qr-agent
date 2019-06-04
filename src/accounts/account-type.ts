/**
 * Different types of accounts created with different auth providers.
 */
export enum AccountType {
    /**
     * Account that has been registered in-app by providing a username + password.
     */
    App = "app",
  
    /**
     * Account that has been created by signing in with a Google account.
     */
    Google = "google"
  }