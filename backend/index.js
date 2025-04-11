const express = require('express');
const multer = require('multer');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

app.post('/upload', upload.single('image'), async (req, res) => {
  const imagePath = path.join(__dirname, req.file.path);

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('https://web.whatsapp.com');

  // Wait for QR code to load
  await page.waitForSelector('canvas[aria-label="Scan me!"]', { timeout: 0 });

  // Extract QR code as data URL
  const qrCode = await page.evaluate(() => {
    const canvas = document.querySelector('canvas[aria-label="Scan me!"]');
    return canvas.toDataURL();
  });

  res.json({ qrCode });

  // Wait for user to scan QR code and WhatsApp Web to load
  await page.waitForSelector('div[data-tab="3"]', { timeout: 0 });

  // Navigate to profile settings
  await page.click('div[data-tab="3"]');

  // Wait for profile picture element
  await page.waitForSelector('img[alt="Profile photo"]');

  // Click on profile picture to change it
  const [fileChooser] = await Promise.all([
    page.waitForFileChooser(),
    page.click('img[alt="Profile photo"]'),
  ]);

  // Upload new profile picture
  await fileChooser.accept([imagePath]);

  // Wait for upload to complete
  await page.waitForTimeout(5000);

  await browser.close();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
