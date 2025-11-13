//import { chromium } from 'playwright';
//import fs from 'fs/promises';
//import path from 'path';

/**
 * Scrapes Songsterr tab data from a given URL and saves it to a file
 * @param {string} url - The Songsterr tab URL to scrape
 * @param {string} filepath - Full path where to save the JSON file (including filename)
 * @returns {Promise<{data: Array, count: number}>} - The captured data and count
 */
export async function scrapeSongsterrTab(url, filepath) {
  if (!url || !url.includes('songsterr.com')) {
    throw new Error('Invalid Songsterr URL')
  }

  const browser = await chromium.launch({ headless: true })

  try {
    const page = await browser.newPage()
    const array = []

    // Intercept network responses
    page.on('response', async (response) => {
      const responseUrl = response.url()
      if (responseUrl.includes('cloudfront.net')) {
        try {
          const data = await response.json()
          array.push(data)
          console.log('Captured:', responseUrl)
        } catch (e) {
          // Ignore non-JSON responses
        }
      }
    })

    console.log('Navigating to:', url)
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 60000, // 60 second timeout
    })

    // Optional: Wait a bit more if needed
    await page.waitForTimeout(2000)

    console.log(`Captured ${array.length} items`)

    // Ensure directory exists
    const directory = path.dirname(filepath)
    await fs.mkdir(directory, { recursive: true })

    // Save to file
    await fs.writeFile(filepath, JSON.stringify(array, null, 2), 'utf-8')
    console.log('Saved to:', filepath)

    return {
      data: array,
      count: array.length,
    }
  } finally {
    await browser.close()
  }
}
