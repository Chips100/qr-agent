import { QRCodeGenerator } from './qrcode-generator';

describe('QRCodeGenerator', () => {
    it('should produce an SVG representation', async () => {
        const sut = new QRCodeGenerator();
        const result = await sut.createSvg('Hello, World!');

        // Just check for SVG-content.
        expect(result).toMatch(/^<svg.*<\/svg>$/)
    });
});