import QRCode = require('qrcode');

/**
 * Creates QR codes that encode specified strings.
 */
export class QRCodeGenerator {
    /**
     * Creates an SVG of a QR code encoding the specified string.
     * @param value String value that should be encoded.
     */
    public async createSvg(value: string): Promise<string> {
        const options: QRCode.QRCodeToStringOptions = {
            type: "svg"
        };

        // Trim result.
        const result = await QRCode.toString(value, options);
        return result.trim();
    }
}