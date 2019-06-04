import { AuthProvider } from "./auth-provider";
import { AccountService } from "./account-service";
import { VerifyClaimResult } from "./verify-claim-result";
import { MemoryStorageAdapter } from "../events/adapters/memory-adapter";
import { EventStore } from "../events/event-store";
import { AccountType } from "./account-type";
import { AccountCreatedEvent } from "./account-created.event";

describe('AccountService', () => {
    it('should use the auth provider registered for the account type.', async () => {
        // Include payload in accountId to check correct call of auth provider.
        const appAuthProviderMock = new AuthProviderMock(payload => ({ verified: true, accountId: "123-" + payload }));
        const googleAuthProviderMock = new AuthProviderMock(payload => ({ verified: false, accountId: null }));

        const sut = new AccountService(new EventStore(new MemoryStorageAdapter()), {
            [AccountType.App]: appAuthProviderMock,
            [AccountType.Google]: googleAuthProviderMock
        });

        // First sign in with type App.
        const result = await sut.signIn(AccountType.App, "x");
        expect(result.verified).toBeTruthy();
        expect(result.accountId).toEqual("app:123-x");
        
        // Second sign in with type Google.
        const result2 = await sut.signIn(AccountType.Google, "x");
        expect(result2.verified).toBeFalsy();
        expect(result2.accountId).toBeNull();
    });

    it('should not create an AccountCreatedEvent if the account already exists.', async () => {
        // Start with event already in the storage.
        const memoryAdapter = new MemoryStorageAdapter();
        const event = new AccountCreatedEvent();
        event.id = "app:123-x";
        memoryAdapter.storeEvent(event);

        const sut = new AccountService(new EventStore(memoryAdapter), {
            [AccountType.App]: new AuthProviderMock(payload => ({ verified: true, accountId: "123-" + payload })),
            [AccountType.Google]: null
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

        const sut = new AccountService(new EventStore(memoryAdapter), {
            [AccountType.App]: new AuthProviderMock(payload => ({ verified: true, accountId: "123-" + payload })),
            [AccountType.Google]: null
        });

        await sut.signIn(AccountType.App, "x");

        // Expect the new event (first item, as the events should be chronologically descending).
        expect(memoryAdapter.getAllEvents().length).toEqual(2);
        const newEvent = memoryAdapter.getAllEvents()[0];
        expect(newEvent instanceof AccountCreatedEvent).toBeTruthy();
        expect((<AccountCreatedEvent>newEvent).id).toEqual("app:123-x");
    });
});

class AuthProviderMock implements AuthProvider {
    public constructor(private mockAction: (payload: any) => VerifyClaimResult) { } 

    async verifyClaim(payload: any): Promise<VerifyClaimResult> {
        return this.mockAction(payload);
    }
}