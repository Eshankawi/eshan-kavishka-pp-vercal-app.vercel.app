
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

app.post('/api/set-profile', upload.single('image'), async (req, res) => {
  const { number } = req.body;
  const imagePath = req.file.path;

  if (!number || !req.file) {
    return res.status(400).send('Missing number or image.');
  }

  try {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto('https://web.whatsapp.com');
    await page.waitForSelector('canvas', { timeout: 60000 });
    // simulate login and profile picture change (dummy for example)
    await browser.close();
    res.send('Profile picture updated (dummy response).');
  } catch (err) {
    res.status(500).send('Failed to update profile picture.');
  } finally {
    fs.unlinkSync(imagePath);
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
