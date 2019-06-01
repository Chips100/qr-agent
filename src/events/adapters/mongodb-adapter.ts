import { EventFilter } from "../event-filter";
import { Event } from "../event";
import { StorageAdapter } from "../storage-adapter";

import mongo = require('mongodb');

/**
 * Storage adapter that uses a Mongo database.
 */
export class MongoDBStorageAdapter implements StorageAdapter {
    // Connection should only be opened once, resulting client will be reused.
    // https://stackoverflow.com/questions/10656574/how-do-i-manage-mongodb-connections-in-a-node-js-web-application
    private _cachedClient: mongo.MongoClient = null;

    /**
     * Creates a MongoDBStorageAdapter.
     * @param connectionString ConnectionString used to connect to the mongo instance.
     */
    public constructor(private readonly connectionString: string) { }

    /**
     * Stores the specified event.
     * @param event Event that should be stored.
     */
    public async storeEvent(event: Event): Promise<void> {
        const collection = await this.getEventCollection();
        await collection.insertOne(event);
    }    

    /**
     * Reads events from the store that match the specified filter.
     * Events will always be returned in chronologically descending order.
     * @param filter Mask-like filter matched by comparing property values for equality.
     * @param limit Maximum number of events that should be returned.
     */
    public async readEvents(filter: EventFilter, limit: number): Promise<Event[]> {
        const collection = await this.getEventCollection();
        return await collection.find(filter).sort('timestamp', -1).limit(limit).toArray();
    }

    private async getEventCollection(): Promise<mongo.Collection> {
        if (this._cachedClient == null) {
            this._cachedClient = await mongo.MongoClient.connect(this.connectionString);
        }
        
        return this._cachedClient.db('qragent').collection('events');
    }
}