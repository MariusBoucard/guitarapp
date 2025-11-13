import puppeteer from 'puppeteer';

const browser = await puppeteer.launch();
const page = await browser.newPage();

page.on('response', async (response) => {
  const url = response.url();
  if (url.includes('cloudfront.net')) {
    try {
      const data = await response.json();
      console.log('Captured', url)//, JSON.stringify(data, null, 2));
    } catch (e) {}
  }
});

await page.goto('SongLinkHere'); // déclenche toutes les sous-requêtes
