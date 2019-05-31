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
     * Reads the configuration from the specified file.
     * @param configFile File to read the configuration from.
     */
    public static read(configFile: string): Configuration {
        return JSON.parse(fs.readFileSync(configFile, "utf8"));
    }
}