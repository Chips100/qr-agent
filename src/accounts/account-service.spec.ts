import { AuthProvider } from "./auth-provider";
import { AccountService } from "./account-service";
import { VerifyClaimResult } from "./verify-claim-result";
import { MemoryStorageAdapter } from "../events/adapters/memory-adapter";
import { EventStore } from "../events/event-store";
import { AccountType } from "./account-type";
import { AccountCreatedEvent } from "./account-created.event";
import { TransientSessionProvider } from "../sessions/transient-session-provider";

describe('AccountService', () => {
    it('should use the auth provider registered for the account type.', async () => {
        // Include payload in accountId to check correct call of auth provider.
        const appAuthProviderMock = new AuthProviderMock(payload => ({ verified: true, accountId: "123-" + payload }));
        const googleAuthProviderMock = new AuthProviderMock(() => ({ verified: false, accountId: "irrelevant" }));

        const sessionProvider = new TransientSessionProvider();
        const sut = new AccountService(sessionProvider, new EventStore(new MemoryStorageAdapter()), {
            [AccountType.App]: appAuthProviderMock,
            [AccountType.Google]: googleAuthProviderMock
        });

        // First sign in with type App.
        await sut.signIn(AccountType.App, "x");
        expect(sessionProvider.getCurrentAccountId()).toEqual("app:123-x");
        
        // Second sign in with type Google.
        sessionProvider.reset();
        await sut.signIn(AccountType.Google, "x");
        expect(sessionProvider.getCurrentAccountId()).toBeFalsy();
    });

    it('should not create an AccountCreatedEvent if the account already exists.', async () => {
        // Start with event already in the storage.
        const memoryAdapter = new MemoryStorageAdapter();
        const event = new AccountCreatedEvent();
        event.id = "app:123-x";
        memoryAdapter.storeEvent(event);

        const sut = new AccountService(new TransientSessionProvider(),new EventStore(memoryAdapter), {
            [AccountType.Google]: null,
            [AccountType.App]: new AuthProviderMock(payload => ({ 
                verified: true, 
                accountId: "123-" + payload, 
                authProviderInformation: { info: "info" } 
            }))
        });

        await sut.signIn(AccountType.App, "x");

        // Expect no new event.
        expect(memoryAdapter.getAllEvents().length).toEqual(1);
    });

    it('should create an AccountCreatedEvent if the account is used for the first time.', async () => {
        // Start with an event for another account (different prefix).
        const memoryAdapter = new MemoryStorageAdapter();
        const event = new AccountCreatedEvent();
        event.id = "google:123-x";
        event.timestamp = new Date(2019, 0, 1);
        memoryAdapter.storeEvent(event);

        const sut = new AccountService(new TransientSessionProvider(),new EventStore(memoryAdapter), {
            [AccountType.Google]: null,
            [AccountType.App]: new AuthProviderMock(payload => ({ 
                verified: true, 
                accountId: "123-" + payload, 
                authProviderInformation: { info: "info" } 
            }))
        });

        await sut.signIn(AccountType.App, "x");

        // Expect the new event (first item, as the events should be chronologically descending).
        expect(memoryAdapter.getAllEvents().length).toEqual(2);
        const newEvent = <AccountCreatedEvent>memoryAdapter.getAllEvents()[0];
        expect(newEvent instanceof AccountCreatedEvent).toBeTruthy();
        expect(newEvent.id).toEqual("app:123-x");
        expect(newEvent.authProviderInformation).toBeTruthy();
        expect(newEvent.authProviderInformation.info).toEqual("info");
    });
});

class AuthProviderMock implements AuthProvider {
    public constructor(private mockAction: (payload: any) => VerifyClaimResult) { } 

    async verifyClaim(payload: any): Promise<VerifyClaimResult> {
        return this.mockAction(payload);
    }
}