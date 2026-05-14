import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(__dirname, '../test-output.pdf');

console.log('🔍 Launching Puppeteer...');

try {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  console.log('✅ Browser launched');
  const page = await browser.newPage();
  await page.setViewport({ width: 638, height: 1013 });
  await page.setContent('<html><body style="background:red;width:638px;height:1013px"><h1 style="color:white">GCST TEST</h1></body></html>', { waitUntil: 'domcontentloaded' });
  await page.pdf({ path: outPath, width: '638px', height: '1013px', printBackground: true });
  await browser.close();

  const exists = fs.existsSync(outPath);
  const size   = exists ? fs.statSync(outPath).size : 0;
  console.log(`✅ PDF created: ${outPath} (${size} bytes)`);
} catch (err) {
  console.error('❌ Puppeteer error:', err.message);
  console.error(err.stack);
}
