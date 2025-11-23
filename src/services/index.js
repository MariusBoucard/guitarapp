import { AudioService } from './audioService.js'
import { VideoService } from './videoService.js'
import { FileService } from './fileService.js'
import { StorageService } from './storageService.js'
import { SettingsService } from './settingsService.js'
import { UserService } from './userService.js'

/**
 * Service Manager - Central service locator
 * Provides easy access to all services across the application
 */
export class ServiceManager {
  constructor() {
    this.services = new Map()
    this.initializeServices()
  }

  initializeServices() {
    this.services.set('audio', new AudioService(this))
    this.services.set('video', new VideoService(this))
    this.services.set('file', new FileService(this))
    this.services.set('storage', new StorageService(this))
    this.services.set('settings', new SettingsService(this))
    this.services.set('user', new UserService(this))
  }


  getService(serviceName) {
    const service = this.services.get(serviceName)
    if (!service) {
      throw new Error(`Service '${serviceName}' not found`)
    }
    return service
  }

  get audio() {
    return this.getService('audio')
  }

  get video() {
    return this.getService('video')
  }

  get file() {
    return this.getService('file')
  }

  get settings() {
    return this.getService('settings')
  }

  get storage() {
    return this.getService('storage')
  }

  get user() {
    return this.getService('user')
  }

  registerService(name, service) {
    this.services.set(name, service)
  }

  hasService(serviceName) {
    return this.services.has(serviceName)
  }
  cleanup() {
    this.services.forEach((service) => {
      if (typeof service.cleanup === 'function') {
        service.cleanup()
      }
    })
    this.services.clear()
  }
}
export const serviceManager = new ServiceManager()
