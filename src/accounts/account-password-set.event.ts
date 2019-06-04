import { event, Event } from "../events/event";

/**
 * Event representing a new password for an account.
 * Can only be used for accounts of type App.
 */
@event('AccountPasswordSet')
export class AccountPasswordSetEvent extends Event {
  /**
   * ID of the account.
   */
  accountId: string;
  
  /**
   * Password hash generated by using the specified salt.
   */
  passwordHash: string;

  /**
   * Salt that was used to generate the password hash.
   */
  passwordSalt: string;
}