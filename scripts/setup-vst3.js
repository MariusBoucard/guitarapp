#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const https = require('https')
const { execSync } = require('child_process')

console.log('🎛️  VST3 SDK Setup Script')
console.log('==========================')

const projectRoot = path.resolve(__dirname, '..')
const thirdPartyDir = path.join(projectRoot, 'third_party')
const vst3SdkDir = path.join(thirdPartyDir, 'vst3sdk')

// Create third_party directory if it doesn't exist
if (!fs.existsSync(thirdPartyDir)) {
  console.log('📁 Creating third_party directory...')
  fs.mkdirSync(thirdPartyDir, { recursive: true })
}

// Check if VST3 SDK already exists
if (fs.existsSync(vst3SdkDir)) {
  console.log('✅ VST3 SDK directory already exists')
  console.log('   Path:', vst3SdkDir)
  console.log('')
  console.log('📋 Next Steps:')
  console.log('1. Download VST3 SDK from: https://www.steinberg.net/developers/')
  console.log('2. Extract to:', vst3SdkDir)
  console.log('3. Run: npm run vst3:build')
  process.exit(0)
}

console.log('📁 Creating VST3 SDK directory...')
fs.mkdirSync(vst3SdkDir, { recursive: true })

// Create a placeholder structure
const placeholderDirs = [
  'base',
  'pluginterfaces',
  'public.sdk',
  'public.sdk/source',
  'public.sdk/source/vst',
  'public.sdk/source/vst/hosting',
]

placeholderDirs.forEach((dir) => {
  const fullPath = path.join(vst3SdkDir, dir)
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true })
  }
})

// Create placeholder README
const readmeContent = `# VST3 SDK Placeholder

This directory should contain the VST3 SDK from Steinberg.

## Setup Instructions:

1. Download VST3 SDK from: https://www.steinberg.net/developers/
2. Extract the SDK contents to this directory
3. The structure should look like:
   - base/
   - pluginterfaces/
   - public.sdk/
   - cmake/
   - doc/
   - samples/

4. After extracting, run: npm run vst3:build

## License Note:
The VST3 SDK has its own licensing terms. Please review Steinberg's 
license agreement before using in commercial applications.
`

fs.writeFileSync(path.join(vst3SdkDir, 'README_SETUP.md'), readmeContent)

console.log('✅ VST3 SDK placeholder structure created')
console.log('')
console.log('🔗 Manual Setup Required:')
console.log('==========================')
console.log('1. Visit: https://www.steinberg.net/developers/')
console.log('2. Download the VST3 SDK (requires free registration)')
console.log('3. Extract to:', vst3SdkDir)
console.log('4. Run: npm run vst3:build')
console.log('')
console.log('📝 Note: The VST3 SDK cannot be automatically downloaded')
console.log("   due to Steinberg's licensing requirements.")

// Check for required build tools
console.log('')
console.log('🔧 Checking Build Tools:')
console.log('========================')

const checkCommand = (command, name) => {
  try {
    execSync(command, { stdio: 'ignore' })
    console.log(`✅ ${name} - Available`)
    return true
  } catch (error) {
    console.log(`❌ ${name} - Not found`)
    return false
  }
}

const hasNode = checkCommand('node --version', 'Node.js')
const hasPython =
  checkCommand('python --version', 'Python') || checkCommand('python3 --version', 'Python3')
const hasGit = checkCommand('git --version', 'Git')

if (process.platform === 'win32') {
  console.log('🪟 Windows Platform Detected')
  console.log('   Required: Visual Studio with C++ tools')
  console.log('   Install: https://visualstudio.microsoft.com/vs/features/cplusplus/')
} else if (process.platform === 'darwin') {
  console.log('🍎 macOS Platform Detected')
  const hasXcode = checkCommand('xcode-select --version', 'Xcode Command Line Tools')
  if (!hasXcode) {
    console.log('   Install: xcode-select --install')
  }
} else {
  console.log('🐧 Linux Platform Detected')
  const hasGcc = checkCommand('gcc --version', 'GCC')
  const hasMake = checkCommand('make --version', 'Make')
  if (!hasGcc || !hasMake) {
    console.log('   Install build tools: sudo apt-get install build-essential')
  }
}

if (!hasNode || !hasPython) {
  console.log('')
  console.log('❌ Missing required build tools. Please install before continuing.')
  process.exit(1)
}

console.log('')
console.log('🚀 Ready for VST3 Integration!')
console.log('   After downloading the SDK, run: npm run vst3:build')
