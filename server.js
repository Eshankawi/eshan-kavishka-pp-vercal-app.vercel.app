const express = require('express');
const puppeteer = require('puppeteer');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Set up multer for file upload
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));
app.use(express.json());

// Endpoint to upload the image
app.post('/upload', upload.single('file'), async (req, res) => {
    const filePath = path.join(__dirname, 'uploads', req.file.filename);
    
    // Generate QR code and handle WhatsApp login
    try {
        const qrCodeUrl = await generateQRCode(filePath);
        res.json({ qrCodeUrl });
    } catch (error) {
        console.error('Error generating QR code:', error);
        res.status(500).send('Error generating QR code');
    }
});

// Function to generate QR code and set the profile picture
async function generateQRCode(imagePath) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto('https://web.whatsapp.com/');

    // Wait for the QR code to be visible
    await page.waitForSelector('canvas[aria-label="Scan me!"]');
    
    // Capture QR code image URL
    const qrCodeUrl = await page.evaluate(() => {
        const canvas = document.querySelector('canvas[aria-label="Scan me!"]');
        return canvas.toDataURL();
    });

    // Wait for the user to scan the QR code and log in
    await page.waitForSelector('div[data-tab="3"]'); // Wait for WhatsApp page to be logged in

    // Set profile picture after login
    await page.goto('https://web.whatsapp.com/settings/profile');
    const input = await page.$('input[type="file"]');
    await input.uploadFile(imagePath); // Upload the profile picture
    
    // Wait for upload to complete
    await page.waitForTimeout(2000);

    await browser.close();

    // Return QR code URL to frontend
    return qrCodeUrl;
}

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
