<template>
  <div class="user-management">
    <div class="user-header">
      <h2>👤 {{ $t('user.management') }}</h2>
      <button class="close-btn" @click="$emit('close')">✕</button>
    </div>

    <!-- Current User Display -->
    <div class="current-user-section">
      <h3>{{ $t('user.current_user') }}</h3>
      <div class="user-card current">
        <div class="user-avatar">
          {{ userStore.currentUser?.name?.charAt(0).toUpperCase() || '?' }}
        </div>
        <div class="user-info">
          <h4>{{ userStore.currentUser?.name || $t('user.no_user') }}</h4>
          <p class="user-email">{{ userStore.currentUser?.email || $t('user.no_email') }}</p>
          <p class="user-meta">
            {{ $t('user.last_active') }}: {{ formatDate(userStore.currentUser?.lastActive) }}
          </p>
        </div>
      </div>
    </div>

    <!-- User List -->
    <div class="users-list-section">
      <div class="section-header">
        <h3>{{ $t('user.all_users', { count: userStore.totalUsers }) }}</h3>
        <button class="btn-primary" @click="showCreateUserDialog = true">
          ➕ {{ $t('user.new_user') }}
        </button>
      </div>

      <div class="users-grid">
        <div
          v-for="user in userStore.users"
          :key="user.id"
          class="user-card"
          :class="{ active: user.id === userStore.currentUserId }"
        >
          <div class="user-avatar">
            {{ user.name.charAt(0).toUpperCase() }}
          </div>
          <div class="user-info">
            <h4>{{ user.name }}</h4>
            <p class="user-email">{{ user.email || $t('user.no_email') }}</p>
            <p class="user-meta">{{ $t('user.created') }}: {{ formatDate(user.createdAt) }}</p>
          </div>
          <div class="user-actions">
            <button
              v-if="user.id !== userStore.currentUserId"
              @click="switchToUser(user.id)"
              class="btn-action"
              :title="$t('user.switch_to')"
            >
              🔄 {{ $t('user.switch') }}
            </button>
            <button @click="editUser(user)" class="btn-action" :title="$t('user.edit_user')">
              ✏️ {{ $t('user.edit') }}
            </button>
            <button
              @click="exportUserData(user.id)"
              class="btn-action"
              :title="$t('user.export_user')"
            >
              💾 {{ $t('user.export') }}
            </button>
            <button
              @click="cloneUserData(user.id)"
              class="btn-action"
              :title="$t('user.clone_user')"
            >
              📋 {{ $t('user.clone') }}
            </button>
            <button
              v-if="userStore.totalUsers > 1"
              @click="confirmDeleteUser(user)"
              class="btn-danger"
              :title="$t('user.delete_user')"
            >
              🗑️ {{ $t('user.delete') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Import/Export Section -->
    <div class="import-export-section">
      <h3>{{ $t('user.import_export') }}</h3>
      <div class="actions-grid">
        <button @click="saveAllUsersNow" class="btn-primary" :title="$t('user.save_all_desc')">
          💾 {{ $t('user.save_all') }}
        </button>
        <button @click="checkStorage" class="btn-secondary" :title="$t('user.check_storage_desc')">
          🔍 {{ $t('user.check_storage') }}
        </button>
        <button @click="importUser" class="btn-secondary">📥 {{ $t('user.import') }}</button>
        <button @click="importAllUsers" class="btn-secondary">
          📥 {{ $t('user.import_all') }}
        </button>
        <button @click="exportAllUsers" class="btn-secondary">
          💾 {{ $t('user.export_all') }}
        </button>
        <button @click="createBackup" class="btn-secondary">
          🔄 {{ $t('user.create_backup') }}
        </button>
        <button @click="restoreBackup" class="btn-secondary">
          ⏮️ {{ $t('user.restore_backup') }}
        </button>
      </div>

      <!-- Storage Stats -->
      <div class="storage-stats">
        <p>
          <strong>{{ $t('user.storage_used') }}:</strong> {{ storageStats.formattedSize }}
        </p>
        <p v-if="userStore.lastExportDate">
          <strong>{{ $t('user.last_export') }}:</strong> {{ formatDate(userStore.lastExportDate) }}
        </p>
        <p v-if="userStore.lastImportDate">
          <strong>{{ $t('user.last_import') }}:</strong> {{ formatDate(userStore.lastImportDate) }}
        </p>
      </div>
    </div>

    <!-- Create User Dialog -->
    <div
      v-if="showCreateUserDialog"
      class="modal-overlay"
      @click.self="showCreateUserDialog = false"
    >
      <div class="modal-dialog">
        <h3>{{ $t('user.create_new_user') }}</h3>
        <form @submit.prevent="createNewUser">
          <div class="form-group">
            <label>{{ $t('user.user_name') }} *</label>
            <input
              v-model="newUserForm.name"
              type="text"
              required
              :placeholder="$t('user.enter_user_name')"
            />
          </div>
          <div class="form-group">
            <label>{{ $t('user.email_optional') }}</label>
            <input
              v-model="newUserForm.email"
              type="email"
              :placeholder="$t('user.email_placeholder')"
            />
          </div>
          <div class="form-actions">
            <button type="button" @click="showCreateUserDialog = false" class="btn-secondary">
              {{ $t('user.cancel') }}
            </button>
            <button type="submit" class="btn-primary">{{ $t('user.create_user') }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit User Dialog -->
    <div v-if="showEditUserDialog" class="modal-overlay" @click.self="showEditUserDialog = false">
      <div class="modal-dialog">
        <h3>{{ $t('user.edit_user') }}</h3>
        <form @submit.prevent="saveUserEdit">
          <div class="form-group">
            <label>{{ $t('user.user_name') }} *</label>
            <input
              v-model="editUserForm.name"
              type="text"
              required
              :placeholder="$t('user.enter_user_name')"
            />
          </div>
          <div class="form-group">
            <label>{{ $t('user.email_optional') }}</label>
            <input
              v-model="editUserForm.email"
              type="email"
              :placeholder="$t('user.email_placeholder')"
            />
          </div>
          <div class="form-actions">
            <button type="button" @click="showEditUserDialog = false" class="btn-secondary">
              {{ $t('user.cancel') }}
            </button>
            <button type="submit" class="btn-primary">{{ $t('user.save_changes') }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <div v-if="showDeleteDialog" class="modal-overlay" @click.self="showDeleteDialog = false">
      <div class="modal-dialog danger">
        <h3>⚠️ {{ $t('user.delete_user') }}</h3>
        <p>{{ $t('user.delete_confirm', { name: userToDelete?.name }) }}</p>
        <p class="warning-text">{{ $t('user.delete_warning') }}</p>
        <div class="form-actions">
          <button @click="showDeleteDialog = false" class="btn-secondary">
            {{ $t('user.cancel') }}
          </button>
          <button @click="deleteUser" class="btn-danger">{{ $t('user.delete_user') }}</button>
        </div>
      </div>
    </div>

    <!-- Messages/Notifications -->
    <div v-if="message" class="message" :class="message.type">
      {{ message.text }}
    </div>
  </div>
</template>

<script>
  import { useUserStore } from '../stores/userStore.js'
  import { serviceManager } from '../services/index.js'

  export default {
    name: 'UserManagementComponent',

    setup() {
      const userStore = useUserStore()
      const userService = serviceManager.user

      return {
        userStore,
        userService,
      }
    },

    data() {
      return {
        showCreateUserDialog: false,
        showEditUserDialog: false,
        showDeleteDialog: false,
        userToDelete: null,
        message: null,

        newUserForm: {
          name: '',
          email: '',
        },

        editUserForm: {
          id: null,
          name: '',
          email: '',
        },

        storageStats: {
          formattedSize: '0 B',
        },
      }
    },

    mounted() {
      this.updateStorageStats()
    },

    methods: {
      // Manual save and diagnostic methods
      saveAllUsersNow() {
        try {
          console.log('🔵 MANUAL SAVE: User clicked "Save All Users Now"')
          console.log('🔵 Current users before save:', this.userStore.users.length)
          this.userStore.users.forEach((user, idx) => {
            console.log(`  ${idx + 1}. ${user.name} (${user.id})`)
          })

          this.userStore.saveUsersToStorage()

          // Verify it was saved
          const savedData = localStorage.getItem('guitarapp_users')
          if (savedData) {
            const parsed = JSON.parse(savedData)
            console.log('✅ MANUAL SAVE: Verified in localStorage:', parsed.users.length, 'users')
            this.showMessage(`✅ Saved ${parsed.users.length} users to localStorage`, 'success')
          } else {
            console.error('❌ MANUAL SAVE: Nothing in localStorage after save!')
            this.showMessage('❌ Save failed - no data in localStorage', 'error')
          }

          this.updateStorageStats()
        } catch (error) {
          console.error('❌ MANUAL SAVE: Error:', error)
          this.showMessage(`Error saving: ${error.message}`, 'error')
        }
      },

      checkStorage() {
        try {
          console.log('='.repeat(80))
          console.log('🔍 STORAGE CHECK: Reading localStorage...')

          const savedData = localStorage.getItem('guitarapp_users')
          if (savedData) {
            const parsed = JSON.parse(savedData)
            console.log('📦 Found data in localStorage:')
            console.log('   - Format:', parsed.users ? 'NEW (with metadata)' : 'OLD (array only)')
            console.log('   - Users count:', (parsed.users || parsed).length)
            console.log('   - Current user ID:', parsed.currentUserId || 'not set')

            const users = parsed.users || parsed
            users.forEach((user, idx) => {
              console.log(`   ${idx + 1}. ${user.name} (${user.id})`)
              console.log(`      - Email: ${user.email || 'none'}`)
              console.log(`      - Created: ${user.createdAt}`)
              console.log(`      - Trainings: ${user.data?.trainings?.length || 0}`)
              console.log(`      - Videos: ${user.data?.videos?.length || 0}`)
            })

            console.log('📊 In-memory store state:')
            console.log('   - Users count:', this.userStore.users.length)
            console.log('   - Current user ID:', this.userStore.currentUserId)
            this.userStore.users.forEach((user, idx) => {
              console.log(`   ${idx + 1}. ${user.name} (${user.id})`)
            })

            this.showMessage(
              `Found ${users.length} users in localStorage. Check console for details.`,
              'success'
            )
          } else {
            console.log('⚠️ No data found in localStorage')
            this.showMessage('⚠️ No data found in localStorage', 'warning')
          }
          console.log('='.repeat(80))
        } catch (error) {
          console.error('❌ Error checking storage:', error)
          this.showMessage(`Error: ${error.message}`, 'error')
        }
      },

      // User Management
      async createNewUser() {
        try {
          if (!this.newUserForm.name.trim()) {
            this.showMessage('Please enter a user name', 'error')
            return
          }

          console.log('🟢 Creating new user:', this.newUserForm.name)
          const userId = this.userStore.createUser(this.newUserForm.name, this.newUserForm.email)
          console.log('🟢 User created with ID:', userId)
          console.log('🟢 Total users now:', this.userStore.users.length)

          this.showMessage(`User "${this.newUserForm.name}" created successfully`, 'success')
          this.showCreateUserDialog = false
          this.newUserForm = { name: '', email: '' }
          this.updateStorageStats()
        } catch (error) {
          console.error('❌ Error creating user:', error)
          this.showMessage(`Error creating user: ${error.message}`, 'error')
        }
      },

      editUser(user) {
        this.editUserForm = {
          id: user.id,
          name: user.name,
          email: user.email || '',
        }
        this.showEditUserDialog = true
      },

      async saveUserEdit() {
        try {
          this.userStore.updateUserProfile(this.editUserForm.id, {
            name: this.editUserForm.name,
            email: this.editUserForm.email,
          })

          this.showMessage('User updated successfully', 'success')
          this.showEditUserDialog = false
        } catch (error) {
          this.showMessage(`Error updating user: ${error.message}`, 'error')
        }
      },

      confirmDeleteUser(user) {
        this.userToDelete = user
        this.showDeleteDialog = true
      },

      async deleteUser() {
        try {
          this.userStore.deleteUser(this.userToDelete.id)
          this.showMessage(`User "${this.userToDelete.name}" deleted`, 'success')
          this.showDeleteDialog = false
          this.userToDelete = null
          this.updateStorageStats()
        } catch (error) {
          this.showMessage(`Error deleting user: ${error.message}`, 'error')
        }
      },

      switchToUser(userId) {
        try {
          this.userStore.switchUser(userId)
          this.showMessage('Switched user successfully - all stores updated', 'success')
          // No need to reload - stores are reactive and will update automatically
        } catch (error) {
          this.showMessage(`Error switching user: ${error.message}`, 'error')
        }
      },

      // Import/Export
      exportUserData(userId) {
        try {
          const result = this.userService.exportUserToFile(this.userStore, userId)
          this.showMessage(`Exported to ${result.filename}`, 'success')
        } catch (error) {
          this.showMessage(`Export failed: ${error.message}`, 'error')
        }
      },

      async exportAllUsers() {
        try {
          // Note: exportAllUsers is now async
          const result = await this.userService.exportAllUsersToFile(this.userStore)
          this.showMessage(`Exported all users to ${result.filename}`, 'success')
        } catch (error) {
          this.showMessage(`Export failed: ${error.message}`, 'error')
        }
      },

      async importUser() {
        try {
          const result = await this.userService.importUserFromFile(this.userStore, false)
          this.showMessage(`Imported user: ${result.userName}`, 'success')
          this.updateStorageStats()
        } catch (error) {
          this.showMessage(`Import failed: ${error.message}`, 'error')
        }
      },

      async importAllUsers() {
        try {
          const result = await this.userService.importAllUsersFromFile(this.userStore)
          this.showMessage(`Imported ${result.importedUsers.length} users`, 'success')
          this.updateStorageStats()
        } catch (error) {
          this.showMessage(`Import failed: ${error.message}`, 'error')
        }
      },

      async cloneUserData(userId) {
        try {
          const user = this.userStore.getUserById(userId)
          const newName = prompt(`Enter name for cloned user:`, `${user.name} (Copy)`)

          if (newName) {
            const result = this.userService.cloneUser(this.userStore, userId, newName)
            this.showMessage(`User cloned as "${result.newUserName}"`, 'success')
            this.updateStorageStats()
          }
        } catch (error) {
          this.showMessage(`Clone failed: ${error.message}`, 'error')
        }
      },

      async createBackup() {
        try {
          const result = this.userService.createBackup(this.userStore)
          this.showMessage(`Backup created at ${this.formatDate(result.timestamp)}`, 'success')
        } catch (error) {
          this.showMessage(`Backup failed: ${error.message}`, 'error')
        }
      },

      async restoreBackup() {
        try {
          if (
            !confirm(
              'Are you sure you want to restore from backup? Current data will be overwritten.'
            )
          ) {
            return
          }

          const result = this.userService.restoreFromBackup(this.userStore)
          this.showMessage(`Restored ${result.usersRestored} users from backup`, 'success')

          // Reload to apply restored data
          setTimeout(() => {
            window.location.reload()
          }, 1500)
        } catch (error) {
          this.showMessage(`Restore failed: ${error.message}`, 'error')
        }
      },

      // Utility
      formatDate(dateString) {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        return date.toLocaleString()
      },

      updateStorageStats() {
        this.storageStats = this.userService.getStorageStats()
      },

      showMessage(text, type = 'info') {
        this.message = { text, type }
        setTimeout(() => {
          this.message = null
        }, 5000)
      },
    },
  }
</script>

<style scoped>
  .user-management {
    max-width: 1200px;
    margin: 20px auto;
    padding: 20px;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  .user-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding-bottom: 15px;
    border-bottom: 2px solid #667eea;
  }

  .user-header h2 {
    margin: 0;
    color: #2c3e50;
    font-size: 1.8rem;
  }

  .close-btn {
    background: #ff6b6b;
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-size: 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .close-btn:hover {
    background: #ee5a52;
    transform: rotate(90deg);
  }

  /* Current User Section */
  .current-user-section {
    margin-bottom: 30px;
    background: rgba(255, 255, 255, 0.8);
    padding: 20px;
    border-radius: 12px;
  }

  .current-user-section h3 {
    margin-top: 0;
    color: #667eea;
  }

  /* User Cards */
  .user-card {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }

  .user-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .user-card.current {
    border: 2px solid #667eea;
    background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
  }

  .user-card.active {
    border: 2px solid #51cf66;
  }

  .user-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: bold;
    flex-shrink: 0;
  }

  .user-info {
    flex: 1;
  }

  .user-info h4 {
    margin: 0 0 5px 0;
    color: #2c3e50;
    font-size: 1.2rem;
  }

  .user-email {
    color: #7f8c8d;
    font-size: 0.9rem;
    margin: 3px 0;
  }

  .user-meta {
    color: #95a5a6;
    font-size: 0.85rem;
    margin: 3px 0;
  }

  .user-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  /* Users List Section */
  .users-list-section {
    margin-bottom: 30px;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }

  .section-header h3 {
    margin: 0;
    color: #2c3e50;
  }

  .users-grid {
    display: grid;
    gap: 15px;
  }

  /* Import/Export Section */
  .import-export-section {
    background: rgba(255, 255, 255, 0.8);
    padding: 20px;
    border-radius: 12px;
  }

  .import-export-section h3 {
    margin-top: 0;
    color: #667eea;
  }

  .actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 10px;
    margin-bottom: 20px;
  }

  .storage-stats {
    padding: 15px;
    background: rgba(102, 126, 234, 0.1);
    border-radius: 8px;
    margin-top: 15px;
  }

  .storage-stats p {
    margin: 5px 0;
    color: #2c3e50;
  }

  /* Buttons */
  .btn-primary,
  .btn-secondary,
  .btn-action,
  .btn-danger {
    padding: 10px 16px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.9rem;
  }

  .btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  .btn-secondary {
    background: #ecf0f1;
    color: #2c3e50;
  }

  .btn-secondary:hover {
    background: #bdc3c7;
  }

  .btn-action {
    padding: 6px 12px;
    background: #3498db;
    color: white;
    font-size: 0.85rem;
  }

  .btn-action:hover {
    background: #2980b9;
  }

  .btn-danger {
    background: #e74c3c;
    color: white;
  }

  .btn-danger:hover {
    background: #c0392b;
  }

  /* Modal */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-dialog {
    background: white;
    padding: 30px;
    border-radius: 16px;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  }

  .modal-dialog.danger {
    border: 2px solid #e74c3c;
  }

  .modal-dialog h3 {
    margin-top: 0;
    color: #2c3e50;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-group label {
    display: block;
    margin-bottom: 8px;
    color: #2c3e50;
    font-weight: 600;
  }

  .form-group input {
    width: 100%;
    padding: 12px;
    border: 2px solid #e0e6ed;
    border-radius: 8px;
    font-size: 1rem;
    box-sizing: border-box;
  }

  .form-group input:focus {
    outline: none;
    border-color: #667eea;
  }

  .form-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 20px;
  }

  .warning-text {
    color: #e74c3c;
    font-weight: 600;
    margin: 15px 0;
  }

  /* Messages */
  .message {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 15px 25px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 2000;
    animation: slideIn 0.3s ease;
  }

  .message.success {
    background: #2ecc71;
    color: white;
  }

  .message.error {
    background: #e74c3c;
    color: white;
  }

  .message.info {
    background: #3498db;
    color: white;
  }

  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .user-management {
      padding: 15px;
    }

    .user-header h2 {
      font-size: 1.4rem;
    }

    .actions-grid {
      grid-template-columns: 1fr;
    }

    .user-actions {
      flex-direction: column;
    }
  }
</style>
