import fs = require('fs');

/**
 * Represents the configuration of the application.
 */
export class Configuration {
    // Private constructor to force creation with read method.
    private constructor() {}

    /**
     * Public visible domain that can be used to access the app.
     */
    public readonly publicDomain: string;

    /**
     * URL prefix for landing page of QR-Code visits.
     */
    public readonly visitPrefix: string;
    
    /**
     * Port to listen on, if not configured in the environment.
     */
    public readonly fallbackPort: number;

    /**
     * Configuration of the EventStore.
     */
    public readonly eventStore: {
        /**
         * If set to true, the event store will be filled with some initial demo events.
         */
        readonly fillWithDemoEvents: boolean;

        /**
         * If configured, MongoDB will be used for persistent storage of events.
         */
        readonly mongo: {
            /**
             * URL used to connect to the mongo instance.
             */
            readonly url: string;
        };

        /**
         * If configured, an in-memory adapter will be used for storage of events (non-persistent).
         */
        readonly memory: boolean;
    }

    /**
     * Reads the configuration from the specified file.
     * @param configFile File to read the configuration from.
     */
    public static read(configFile: string): Configuration {
        return JSON.parse(fs.readFileSync(configFile, "utf8"));
    }
}