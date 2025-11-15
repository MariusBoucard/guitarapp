import { ipcMain } from 'electron'
import { join, extname, basename } from 'path'
import fs from 'fs-extra'

/**
 * Video File Handlers
 */

export function registerVideoHandlers() {
ipcMain.handle('load-video-file', async (event, filePath) => {
  try {
    console.log('🎬 IPC: Validating video file:', filePath);
    
    if (!(await fs.pathExists(filePath))) {
      throw new Error(`File does not exist: ${filePath}`);
    }
    
    const ext = extname(filePath).toLowerCase();
    const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'];
    
    if (!videoExtensions.includes(ext)) {
      throw new Error(`Unsupported video format: ${ext}`);
    }
    
    // DON'T sanitize - keep the native Windows path with backslashes
    // Encode the ORIGINAL path as-is
    const encodedPath = Buffer.from(filePath, 'utf-8').toString('hex');
    
    console.log('✅ IPC: Returning video URL for path:', filePath);
    
    return {
      success: true,
      url: `video-stream://${encodedPath}`,
      fileName: basename(filePath),
    };
  } catch (error) {
    console.error('❌ IPC: Failed to validate video file:', error);
    return {
      success: false,
      error: error.message,
    };
  }
});
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
                lastModified: stats.mtime,
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
