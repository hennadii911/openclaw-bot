import express from 'express';
import { chromium } from 'playwright';

const app = express();
app.use(express.json());

let browser = null;
let page = null;

async function getBrowser() {
  if (!browser) {
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
  }
  return page;
}

app.post('/execute', async (req, res) => {
  try {
    const { url, action, selector, text } = req.body;
    const p = await getBrowser();

    if (url) await p.goto(url);
    if (action === 'click') await p.click(selector);
    if (action === 'type') await p.fill(selector, text);
    if (action === 'screenshot') {
      const img = await p.screenshot({ encoding: 'base64' });
      return res.json({ success: true, screenshot: img });
    }

    const title = await p.title();
    res.json({ success: true, title });
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

app.get('/', (req, res) => {
  res.send('✅ Playwright сервер работает!');
});

app.listen(process.env.PORT || 3000, () => {
  console.log('🚀 Сервер запущен');
});
