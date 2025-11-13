import puppeteer from 'puppeteer';
import fs from 'fs/promises';

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();

let array = [];

page.on('response', async (response) => {
  const url = response.url();
  if (url.includes('cloudfront.net')) {
    try {
      const data = await response.json();
      array.push(data);
      console.log('Captured', url);
    } catch (e) {
      // ignore non-JSON responses
    }
  }
});

await page.goto('https://www.songsterr.com/a/wsa/led-zeppelin-stairway-to-heaven-tab-s27', { waitUntil: 'networkidle2' }); 
// networkidle2 waits for no network requests for 500ms

// Optionally wait a few seconds if requests come slightly later
//await page.waitForTimeout(3000);

// Save to a file
await fs.writeFile('captured_data.json', JSON.stringify(array, null, 2));

await browser.close();
console.log('Saved', array.length, 'items');

