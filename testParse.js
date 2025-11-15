// scrape.js
import puppeteer from 'puppeteer'
import fs from 'fs/promises'

// ✅ Read command-line arguments
const [url, filename] = process.argv.slice(2)

if (!url) {
  console.error('❌ Missing URL. Usage: node scrape.js <url> [filename]')
  process.exit(1)
}

const outputFile = filename || 'captured_data.json' // default

console.log(`Starting scrape for: ${url}`)
console.log(`Output file: ${outputFile}`)

const browser = await puppeteer.launch({ headless: true })
const page = await browser.newPage()

let array = []

page.on('response', async (response) => {
  const responseUrl = response.url()
  if (responseUrl.includes('cloudfront.net')) {
    try {
      const data = await response.json()
      array.push(data)
      console.log('Captured:', responseUrl)
    } catch (e) {
      // ignore
    }
  }
})

await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
await fs.writeFile(outputFile, JSON.stringify(array, null, 2), 'utf-8')

await browser.close()
console.log(`✅ Saved ${array.length} items to ${outputFile}`)
