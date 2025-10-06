# User Management System Documentation

## Overview

The User Management System allows multiple users to maintain separate configurations within the Guitar App. Each user has their own:
- Training data
- Video files and playlists
- Audio files and playlists
- Settings and preferences
- Note selections and colors
- Tuning configurations

## Architecture

### Stores
- **`userStore.js`** - Main store for user management
  - Manages user profiles
  - Handles user switching
  - Captures and restores store states
  - Import/export functionality

### Services
- **`userService.js`** - Service layer for user operations
  - File import/export operations
  - Backup/restore functionality
  - User cloning
  - Storage statistics

### Components
- **`UserManagementComponent.vue`** - UI for user management
  - Create/edit/delete users
  - Switch between users
  - Import/export user data
  - Backup and restore

## Features

### 1. User Profiles
Each user profile contains:
```javascript
{
  id: 'unique_user_id',
  name: 'User Name',
  email: 'user@example.com',
  avatar: 'avatar_url',
  createdAt: '2025-10-06T...',
  lastActive: '2025-10-06T...',
  data: {
    trainings: [],      // Training list with audio files
    videos: [],         // Video trainings
    audioFiles: [],     // Audio file paths
    videoFiles: [],     // Video file paths
    settings: {},       // Display and app settings
    notes: {},          // Note selections
    colors: [],         // Note colors
    tuning: {}          // Guitar tuning config
  }
}
```

### 2. User Operations

#### Create User
```javascript
const userStore = useUserStore()
const userId = userStore.createUser('New User', 'email@example.com')
```

#### Switch User
```javascript
userStore.switchUser(userId)
// Page will reload to apply new user's data
```

#### Delete User
```javascript
userStore.deleteUser(userId)
// Cannot delete the last remaining user
```

#### Update User Profile
```javascript
userStore.updateUserProfile(userId, {
  name: 'Updated Name',
  email: 'new@example.com'
})
```

### 3. Import/Export

#### Export Single User
```javascript
const userService = serviceManager.user
await userService.exportUserToFile(userStore, userId)
// Downloads: guitarapp_user_username_2025-10-06.json
```

#### Export All Users
```javascript
await userService.exportAllUsersToFile(userStore)
// Downloads: guitarapp_all_users_2025-10-06.json
```

#### Import User
```javascript
await userService.importUserFromFile(userStore, overwriteExisting)
// Opens file picker, imports user data
```

#### Import All Users
```javascript
await userService.importAllUsersFromFile(userStore)
// Opens file picker, imports multiple users
```

### 4. Backup & Restore

#### Create Backup
```javascript
const result = userService.createBackup(userStore)
// Stores backup in localStorage
```

#### Restore from Backup
```javascript
const result = userService.restoreFromBackup(userStore)
// Restores all users from last backup
```

### 5. Clone User

#### Clone User Profile
```javascript
const result = userService.cloneUser(userStore, userId, 'New Name')
// Creates a copy of user with all data
```

## Data Flow

### On App Initialization
1. `App.vue` initializes `userStore`
2. `userStore.initialize()` loads users from localStorage
3. Current user is set from saved preference
4. User's data is restored into other stores (trainings, videos, settings, etc.)

### On User Switch
1. Current user's data is captured from all stores
2. New user is set as current
3. New user's data is restored into all stores
4. Page reloads to apply changes

### On Store State Changes
Data flows between stores and user store:
```
Other Stores (trainings, videos, etc.)
         ↕
    User Store
         ↕
  localStorage
```

## Storage

### localStorage Keys
- `guitarapp_users` - Array of all user profiles
- `guitarapp_currentUserId` - ID of currently active user
- `guitarapp_userMeta` - Metadata (export/import dates)
- `guitarapp_backup` - Backup snapshot

### Storage Stats
```javascript
const stats = userService.getStorageStats()
// Returns:
// {
//   totalSize: 12345,
//   usersSize: 10000,
//   metaSize: 345,
//   formattedSize: '12.05 KB'
// }
```

## UI Usage

### Access User Management
1. Open the sidebar
2. Click "👤 User Management" in the Settings section
3. The User Management panel will open

### Create New User
1. Click "➕ New User"
2. Enter user name and optional email
3. Click "Create User"
4. New user is created with default settings

### Switch User
1. Find the user card in the list
2. Click "🔄 Switch"
3. Confirm the switch
4. App reloads with new user's data

### Export User Configuration
1. Click "💾 Export" on any user card
2. JSON file downloads automatically
3. Share this file to transfer configuration

### Import User Configuration
1. Click "📥 Import User"
2. Select a user JSON file
3. User is imported with all settings

## Integration with Existing Stores

The user store automatically syncs with:
- `trainingStore` - Training list and audio files
- `videoStore` - Video trainings and files
- `songPlayerStore` - Audio paths
- `settingsStore` - Display settings, tuning
- `notesStore` - Note selections, colors
- `tuningStore` - Guitar tuning config

### Auto-Sync
When switching users, the system:
1. **Captures** current state from all stores
2. **Saves** to current user's data object
3. **Loads** new user's data
4. **Restores** into all stores

## Best Practices

### 1. Export Regularly
Export your user configuration regularly to prevent data loss:
```javascript
// Export current user
await userService.exportUserToFile(userStore, userStore.currentUserId)

// Or export all users
await userService.exportAllUsersToFile(userStore)
```

### 2. Create Backups Before Major Changes
```javascript
userService.createBackup(userStore)
// Make changes...
// If something goes wrong:
userService.restoreFromBackup(userStore)
```

### 3. Use Descriptive Names
Give users descriptive names:
- "Rock Practice"
- "Jazz Training"
- "Student - John"
- "My Settings 2025"

### 4. Clone for Experimentation
Before trying new settings, clone your user:
```javascript
userService.cloneUser(userStore, userId, 'Experimental Settings')
```

## API Reference

### userStore Actions

| Action | Parameters | Description |
|--------|------------|-------------|
| `initialize()` | - | Load users and set current user |
| `createUser(name, email, avatar)` | name, email?, avatar? | Create new user |
| `deleteUser(userId)` | userId | Delete user (not last one) |
| `switchUser(userId)` | userId | Switch to different user |
| `updateUserProfile(userId, updates)` | userId, updates | Update user info |
| `captureCurrentStoreStates()` | - | Save current state to user |
| `restoreUserStoreStates()` | - | Load user state into stores |
| `exportUser(userId)` | userId | Get export data object |
| `importUser(data, overwrite)` | data, overwrite? | Import user from data |
| `exportAllUsers()` | - | Get all users export data |

### userService Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `exportUserToFile(store, userId)` | userStore, userId | Download user JSON |
| `exportAllUsersToFile(store)` | userStore | Download all users JSON |
| `importUserFromFile(store, overwrite)` | userStore, overwrite? | Import from file picker |
| `importAllUsersFromFile(store)` | userStore | Import multiple users |
| `createBackup(store)` | userStore | Create localStorage backup |
| `restoreFromBackup(store)` | userStore | Restore from backup |
| `cloneUser(store, userId, name)` | userStore, userId, newName | Clone user profile |
| `getStorageStats()` | - | Get storage usage info |

## Troubleshooting

### Users Not Loading
```javascript
// Check if users exist
console.log(userStore.users)

// Force reload from storage
await userStore.loadUsersFromStorage()
```

### Data Not Syncing
```javascript
// Manually capture current state
userStore.captureCurrentStoreStates()

// Manually restore user state
userStore.restoreUserStoreStates()
```

### Storage Full
```javascript
// Check storage usage
const stats = userService.getStorageStats()
console.log(stats.formattedSize)

// Export and delete old users
await userService.exportUserToFile(userStore, oldUserId)
userStore.deleteUser(oldUserId)
```

### Import Fails
- Verify JSON file format
- Check file version compatibility
- Try importing single user instead of bulk

## Future Enhancements

Potential additions:
- Cloud sync for user profiles
- User avatars with image upload
- User groups/teams
- Role-based permissions
- Export to different formats (CSV, XML)
- Encrypted user data
- User activity logs
- Automatic backup scheduling

## Example: Complete Workflow

```javascript
// 1. Initialize on app start
const userStore = useUserStore()
await userStore.initialize()

// 2. Create practice profile
const practiceId = userStore.createUser('Practice Mode', 'practice@example.com')

// 3. Switch to practice profile
userStore.switchUser(practiceId)

// 4. Configure trainings, videos, settings...
// ... user works with the app ...

// 5. Export configuration
const userService = serviceManager.user
await userService.exportUserToFile(userStore, practiceId)

// 6. Create backup before trying new settings
userService.createBackup(userStore)

// 7. Clone for experimentation
const experimentId = userService.cloneUser(userStore, practiceId, 'Experimental')
userStore.switchUser(experimentId)

// 8. If experiment fails, switch back and restore
userStore.switchUser(practiceId)
// or
userService.restoreFromBackup(userStore)
```

## Support

For issues or questions:
1. Check browser console for errors
2. Verify localStorage is enabled
3. Check storage quota
4. Export data before troubleshooting
5. Try creating a fresh user profile

---

**Version:** 1.0.0  
**Last Updated:** October 6, 2025
