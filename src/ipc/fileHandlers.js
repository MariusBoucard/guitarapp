import { ipcMain, dialog } from 'electron'
import { join, extname, basename } from 'path'
import { homedir } from 'os'
import fs from 'fs-extra'

/**
 * File and Directory Selection Handlers
 */

export function registerFileHandlers() {
  // Audio file selection
  ipcMain.handle('select-audio-file', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Audio Files', extensions: ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    })
    
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0]
    }
    return null
  })

  // Video file selection
  ipcMain.handle('select-video-file', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Video Files', extensions: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    })
    
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0]
    }
    return null
  })

  // Directory selection
  ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0]
    }
    return null
  })

  // VST3 Plugin file selection
  ipcMain.handle('select-vst3-plugin', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'VST3 Plugins', extensions: ['vst3'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      title: 'Select VST3 Plugin Files'
    })
    
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths
    }
    return []
  })

  // Directory tree operations
  ipcMain.handle('save-directory-tree', async (event, directoryPath, treeData) => {
    try {
      // Save to app data directory
      const appDataPath = join(homedir(), '.guitarapp')
      await fs.ensureDir(appDataPath)
      
      const treeFilePath = join(appDataPath, 'directory-tree.json')
      const dataToSave = {
        directoryPath,
        lastScanned: new Date().toISOString(),
        tree: treeData
      }
      
      await fs.writeJson(treeFilePath, dataToSave, { spaces: 2 })
      
      return { success: true, filePath: treeFilePath }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  // Load directory tree from file
  ipcMain.handle('load-directory-tree', async () => {
    try {
      const appDataPath = join(homedir(), '.guitarapp')
      const treeFilePath = join(appDataPath, 'directory-tree.json')
      
      if (await fs.pathExists(treeFilePath)) {
        const data = await fs.readJson(treeFilePath)
        
        // Verify the directory still exists
        if (await fs.pathExists(data.directoryPath)) {
          return { success: true, data }
        } else {
          // Directory no longer exists, remove the stale file
          await fs.remove(treeFilePath)
          return { success: false, error: 'Saved directory no longer exists' }
        }
      }
      
      return { success: false, error: 'No saved directory tree found' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  // Legacy parse-directory handler (commented out but kept for reference)
  ipcMain.on('parse-directory', (event, directoryPath) => {
    // Commented out for now - can be implemented if needed
    // fs.readdir(directoryPath, (err, files) => {
    //   if (err) {
    //     event.reply('parse-directory-response', { success: false, error: err.message });
    //   } else {
    //     const fileDetails = files.map(file => {
    //       const filePath = path.join(directoryPath, file);
    //       const stats = fs.statSync(filePath);
    //       return {
    //         name: file,
    //         isDirectory: stats.isDirectory(),
    //         size: stats.size,
    //       };
    //     });
    //     event.reply('parse-directory-response', { success: true, files: fileDetails });
    //   }
    // });
  })

  console.log('✅ File handlers registered')
}
