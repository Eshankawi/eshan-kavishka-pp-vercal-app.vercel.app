const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB setup
mongoose.connect('mongodb+srv://Eshunvrdie1:Eshan%402010@cluster0.iqut1.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = mongoose.model('User', {
  phone: String,
  createdAt: { type: Date, default: Date.now }
});

const Session = mongoose.model('Session', {
  sessionId: String,
  imagePath: String,
  phone: String,
  createdAt: { type: Date, default: Date.now }
});

// Multer setup
const upload = multer({ dest: 'uploads/' });

// Session store
const sessions = {};

// Upload route - sends QR code first
app.post('/upload', upload.single('image'), async (req, res) => {
  const imagePath = path.join(__dirname, req.file.path);
  const phone = req.body.phone;
  const sessionId = Date.now().toString();

  await new User({ phone }).save();
  await new Session({ sessionId, imagePath, phone }).save();

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://web.whatsapp.com');

  // Wait for QR canvas
  await page.waitForSelector('canvas', { timeout: 0 });
  const qrCanvas = await page.$('canvas');
  const qrBuffer = await qrCanvas.screenshot({ encoding: 'base64' });

  // Store session
  sessions[sessionId] = { page, browser, imagePath };

  res.json({ success: false, message: 'Scan the QR code', qr: qrBuffer, sessionId });
});

// Continue route - called after QR scan is complete
app.post('/continue', async (req, res) => {
  const { sessionId } = req.body;
  const session = sessions[sessionId];
  if (!session) return res.status(404).json({ success: false, error: 'Session not found' });

  const { page, browser, imagePath } = session;

  try {
    await page.waitForSelector('img[alt="Profile photo"]', { timeout: 0 });
    await page.click('img[alt="Profile photo"]');
    await page.waitForSelector("div[title='Profile']", { timeout: 0 });
    await page.click("div[title='Profile']");
    await page.waitForSelector('span[data-icon="camera"]', { timeout: 0 });
    await page.click('span[data-icon="camera"]');

    const fileInput = await page.$('input[type="file"]');
    await fileInput.uploadFile(imagePath);
    await page.waitForTimeout(2000);

    const buttons = await page.$$('div[role="button"]');
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.innerText, btn);
      if (text.toLowerCase().includes('save') || text.toLowerCase().includes('done')) {
        await btn.click();
        break;
      }
    }

    await page.waitForTimeout(2000);
    await browser.close();
    fs.unlinkSync(imagePath);

    delete sessions[sessionId];
    res.json({ success: true, message: 'Profile picture updated!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Something went wrong.' });
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
