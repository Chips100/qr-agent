import { QRCodeGenerator } from "./src/qrcode-generation/qrcode-generator";

import express = require('express');

const publicDomain = 'http://localhost/';
const visitPrefix = 'v/'
const port = 80;


const app = express();

// Generate QR-codes.
app.get('/qrcode/:id', async (req, res) => {
    const generator = new QRCodeGenerator();
    const svg = await generator.createSvg(publicDomain + visitPrefix + req.params.id);

    res.setHeader('Content-type', 'image/svg+xml');
    res.send(svg);
});

// Visit QR-codes.
app.get(`/${visitPrefix}:id`, (req, res) => {
    res.send('Visiting id: ' + req.params.id);
});


app.listen(port, () => {
    console.log(`Listening on port ${port}!`);
});