
const puppeteer = require("puppeteer");

module.exports = async (req, res) => {
  const number = req.body.number;
  const imagePath = req.file.path;

  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto("https://web.whatsapp.com");

    // Wait for QR scan and login
    await page.waitForSelector("canvas", { timeout: 0 });

    res.json({ success: true, message: "Login initiated. Scan QR and wait." });

    // Close browser after 1 minute
    setTimeout(() => browser.close(), 60000);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
