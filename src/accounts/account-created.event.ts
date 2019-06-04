import { event, Event } from "../events/event";

/**
 * Event representing the creation of a new account.
 */
@event('AccountCreated')
export class AccountCreatedEvent extends Event {
  /**
   * ID of the account. Will include a prefix to qualify the account
   * type to prevent id conflicts; e.g. "google:id".
   */
  id: string;
}