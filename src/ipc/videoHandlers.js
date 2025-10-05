import { ipcMain } from 'electron'
import { join, extname, basename } from 'path'
import fs from 'fs-extra'

/**
 * Video File Handlers
 */

export function registerVideoHandlers() {
  // Load video file handler
  ipcMain.handle('load-video-file', async (event, filePath) => {
    try {
      console.log('Attempting to load video file:', filePath)
      
      // Verify file exists and is a video file
      if (!await fs.pathExists(filePath)) {
        throw new Error(`File does not exist: ${filePath}`)
      }
      
      const ext = extname(filePath).toLowerCase()
      const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv']
      
      if (!videoExtensions.includes(ext)) {
        throw new Error(`Unsupported video format: ${ext}`)
      }
      
      console.log('File exists and is valid video format')
      
      // Read the video file and create a blob URL
      const videoBuffer = await fs.readFile(filePath)
      const base64Data = videoBuffer.toString('base64')
      
      // Determine MIME type based on extension
      const mimeTypes = {
        '.mp4': 'video/mp4',
        '.avi': 'video/avi',
        '.mov': 'video/quicktime',
        '.wmv': 'video/x-ms-wmv',
        '.flv': 'video/x-flv',
        '.webm': 'video/webm',
        '.mkv': 'video/x-matroska'
      }
      
      const mimeType = mimeTypes[ext] || 'video/mp4'
      
      console.log('Video file loaded successfully:', basename(filePath))
      
      return {
        success: true,
        data: base64Data,
        mimeType: mimeType,
        fileName: basename(filePath)
      }
    } catch (error) {
      console.error('Failed to load video file:', error)
      return {
        success: false,
        error: error.message
      }
    }
  })

  // Scan video directory handler
  ipcMain.handle('scan-video-directory', async (event, directoryPath) => {
    try {
      const allVideos = []
      
      const scanDirectory = async (dirPath) => {
        const items = await fs.readdir(dirPath, { withFileTypes: true })
        
        for (const item of items) {
          const fullPath = join(dirPath, item.name)
          
          if (item.isDirectory()) {
            // Recursively scan subdirectories
            await scanDirectory(fullPath)
          } else if (item.isFile()) {
            const ext = extname(item.name).toLowerCase()
            const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv']
            
            if (videoExtensions.includes(ext)) {
              const stats = await fs.stat(fullPath)
              allVideos.push({
                name: item.name,
                path: fullPath,
                isDirectory: false,
                size: stats.size,
                lastModified: stats.mtime
              })
            }
          }
        }
      }
      
      await scanDirectory(directoryPath)
      console.log(`Found ${allVideos.length} video files in ${directoryPath}`)
      
      return { success: true, videos: allVideos }
    } catch (error) {
      console.error('Failed to scan directory:', error)
      return { success: false, error: error.message }
    }
  })

  console.log('✅ Video handlers registered')
}
