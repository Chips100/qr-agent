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
     * Configuration of express session management.
     */
    public readonly session: {
        /**
         * Secret used for signing.
         */
        readonly secret: string,       
        
        /**
         * If configured, sessions will only work on https connections.
         */
        readonly requireHttps: boolean;

        /**
         * Store used for holding the active sessions.
         */
        readonly store: {
            /**
             * If configured, an in-memory store will be used (development-purpose).
             */
            readonly memory: boolean;

            /**
             * If configured, sessions will be stored in a mongo instance.
             */
            readonly mongo: {
                /**
                 * URL used to connect to the mongo instance.
                 */
                readonly url: string;
            }
        }
    };

    /**
     * Configuration for Google services.
     */
    public readonly google: {
        /**
         * Client ID registered for signing in with Google accounts.
         */
        readonly authClientId: string;
    }

    /**
     * Reads the configuration from the specified file.
     * @param configFile File to read the configuration from.
     */
    public static read(configFile: string): Configuration {
        return JSON.parse(fs.readFileSync(configFile, "utf8"));
    }
}