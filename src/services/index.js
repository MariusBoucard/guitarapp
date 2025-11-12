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

  /**
   * Initialize all services
   */
  initializeServices() {
    this.services.set('audio', new AudioService(this))
    this.services.set('video', new VideoService(this))
    this.services.set('file', new FileService(this))
    this.services.set('storage', new StorageService(this))
    this.services.set('settings', new SettingsService(this))
    this.services.set('user', new UserService(this))
  }

  /**
   * Get a service by name
   */
  getService(serviceName) {
    const service = this.services.get(serviceName)
    if (!service) {
      throw new Error(`Service '${serviceName}' not found`)
    }
    return service
  }

  /**
   * Get audio service
   */
  get audio() {
    return this.getService('audio')
  }

  /**
   * Get video service
   */
  get video() {
    return this.getService('video')
  }

  /**
   * Get file service
   */
  get file() {
    return this.getService('file')
  }

  /**
   * Get settings service
   */
  get settings() {
    return this.getService('settings')
  }

  /**
   * Get storage service
   */
  get storage() {
    return this.getService('storage')
  }

  /**
   * Get user service
   */
  get user() {
    return this.getService('user')
  }

  /**
   * Register a new service
   */
  registerService(name, service) {
    this.services.set(name, service)
  }

  /**
   * Check if service exists
   */
  hasService(serviceName) {
    return this.services.has(serviceName)
  }

  /**
   * Cleanup all services
   */
  cleanup() {
    this.services.forEach((service) => {
      if (typeof service.cleanup === 'function') {
        service.cleanup()
      }
    })
    this.services.clear()
  }
}

// Create singleton instance
export const serviceManager = new ServiceManager()
