# Store Architecture - User-Centric Design

## Overview

The application now uses a **user-centric store architecture** where `userStore` is the **single source of truth** for all user-specific data. Other stores (trainingStore, videoStore, settingsStore, etc.) act as **reactive interfaces** that reference user data directly rather than maintaining separate copies.

## Key Principles

### 1. Single Source of Truth
- **userStore** holds all user profiles and their data
- User data is stored in `userStore.users[].data`
- All user-specific state lives in one place

### 2. Reactive References
- Other stores use **computed getters** that reference `userStore.currentUser.data`
- Changes to user data automatically propagate to all stores
- No manual synchronization or capture/restore needed

### 3. Direct Mutations
- Store actions modify `userStore.currentUser.data` directly
- Changes are immediately reflected across the application
- Single call to `userStore.saveUsersToStorage()` persists all changes

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         UserStore                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ users: [                                              │  │
│  │   {                                                   │  │
│  │     id: 'user_123',                                   │  │
│  │     name: 'John Doe',                                 │  │
│  │     data: {                                           │  │
│  │       trainings: [...],    ←────────────┐            │  │
│  │       videos: [...],       ←─────────┐  │            │  │
│  │       niouTrainingList: [...], ←──┐  │  │            │  │
│  │       audioFiles: [...],    ←──┐  │  │  │            │  │
│  │       videoFiles: [...],    ←┐ │  │  │  │            │  │
│  │       settings: {...},      │ │ │  │  │  │            │  │
│  │       notes: {...},         │ │ │  │  │  │            │  │
│  │       colors: [...],        │ │ │  │  │  │            │  │
│  │       tuning: {...}         │ │ │  │  │  │            │  │
│  │     }                        │ │ │  │  │  │            │  │
│  │   }                          │ │ │  │  │  │            │  │
│  │ ]                            │ │ │  │  │  │            │  │
│  │ currentUserId: 'user_123'    │ │ │  │  │  │            │  │
│  └──────────────────────────────┼─┼─┼──┼──┼──┼────────────┘  │
└─────────────────────────────────┼─┼─┼──┼──┼──┼────────────────┘
                                  │ │ │  │  │  │
                    Reference Only│ │ │  │  │  │Reference Only
                                  │ │ │  │  │  │
    ┌─────────────────────────────┘ │ │  │  │  └─────────────────────────┐
    │                                │ │  │  │                            │
┌───▼────────────┐  ┌────────────────▼─▼──▼──▼────┐  ┌──────────────────▼──┐
│ TrainingStore  │  │      VideoStore              │  │  SongPlayerStore    │
│                │  │                              │  │                     │
│ Getters:       │  │ Getters:                     │  │ Getters:            │
│  trainingList()│  │  videoList()                 │  │  audioPath()        │
│  └─references  │  │  niouTrainingList()          │  │  └─references       │
│    user.data   │  │  videoPath()                 │  │    user.data        │
│                │  │  └─reference user.data       │  │                     │
│ Actions:       │  │                              │  │ Actions:            │
│  addTraining() │  │ Actions:                     │  │  addAudioFile()     │
│  └─modifies    │  │  setNiouTrainingList()       │  │  └─modifies         │
│    user.data   │  │  └─modifies user.data        │  │    user.data        │
└────────────────┘  └──────────────────────────────┘  └─────────────────────┘

         │                        │                            │
         └────────────────────────┴────────────────────────────┘
                                  │
                      All changes saved via
                   userStore.saveUsersToStorage()
```

## Data Flow

### Reading Data (Computed Getters)
```javascript
// In trainingStore.js
getters: {
  trainingList() {
    const userStore = useUserStore()
    // Direct reference to user data - always up-to-date
    return userStore.currentUser?.data?.trainings || []
  }
}
```

### Writing Data (Actions)
```javascript
// In trainingStore.js
actions: {
  addTraining(name) {
    const userStore = useUserStore()
    if (!userStore.currentUser) return
    
    // Directly modify user data
    userStore.currentUser.data.trainings.push({
      id: userStore.currentUser.data.trainings.length,
      name: name,
      list: [],
      audioFiles: []
    })
    
    // Single save call persists everything
    userStore.saveUsersToStorage()
  }
}
```

### Switching Users
```javascript
// In userStore.js
switchUser(userId) {
  // Simply change the current user ID
  this.currentUserId = userId
  
  // All stores automatically reflect new user's data
  // because their getters reference currentUser.data
  
  this.saveUsersToStorage()
}
```

## Store Responsibilities

### UserStore (Single Source of Truth)
- **Holds**: All user profiles and their data
- **Manages**: User creation, deletion, switching
- **Provides**: Current user reference, user list
- **Saves**: Entire user database to localStorage

### Other Stores (Reactive Interfaces)
- **Provide**: Convenient getters for user data
- **Implement**: Business logic and validation
- **Maintain**: UI state (selectedTraining, currentVideo, etc.)
- **Delegate**: All persistence to userStore

## Benefits

### 1. Automatic Synchronization
- User data is always synchronized across all stores
- No manual capture/restore needed
- Switching users instantly updates all components

### 2. Simplified Logic
- No deep copying or JSON.parse/stringify
- Single save operation for all changes
- Reduced code complexity

### 3. True Reactivity
- Vue's reactivity system tracks changes naturally
- Components update automatically when user switches
- Shared object references work as expected

### 4. Easier Debugging
- Single location for all user data
- Clear data ownership and flow
- Simpler to trace data changes

### 5. Better Performance
- No unnecessary data duplication
- Fewer storage operations
- Reduced memory usage

## Migration Notes

### From Old Architecture
```javascript
// OLD: Deep copy approach
trainingStore.trainingList = JSON.parse(JSON.stringify(user.data.trainings))

// NEW: Direct reference
get trainingList() {
  return userStore.currentUser?.data?.trainings || []
}
```

### Initialization
```javascript
// OLD: Async initialization with capture/restore
await userStore.initialize()
await userStore.restoreUserStoreStates()

// NEW: Simple synchronous initialization
userStore.initialize()
// All stores automatically reference current user data
```

## Usage Examples

### Creating a New User
```javascript
const userId = userStore.createUser('Alice', 'alice@example.com')
userStore.switchUser(userId)
// All stores now show Alice's data automatically
```

### Modifying User Data
```javascript
// Add a training - directly modifies user data
trainingStore.addTraining('Guitar Basics')

// Add a video - directly modifies user data
videoStore.setNiouTrainingList(newTrainingList)

// All changes are in userStore.currentUser.data
// Single save persists everything
```

### Switching Between Users
```javascript
// Switch to another user
userStore.switchUser('user_456')

// All components immediately show new user's data:
// - trainingStore.trainingList shows user_456's trainings
// - videoStore.niouTrainingList shows user_456's videos
// - No reload or manual sync required
```

### Exporting/Importing
```javascript
// Export: Data is always current (no capture needed)
const exportData = userStore.exportUser(userId)

// Import: Data is written directly to user.data
userStore.importUser(importData)

// All stores immediately reflect imported data
```

## Implementation Checklist

✅ **UserStore**
- Holds users array with complete data structure
- Provides currentUser getter
- Implements switchUser() without capture/restore
- Saves to localStorage as single source

✅ **TrainingStore**
- Getters reference userStore.currentUser.data
- Actions modify userStore data directly
- Migration support for old localStorage data

✅ **VideoStore**
- Getters reference userStore.currentUser.data
- Actions modify userStore data directly
- Metadata stored in user.data

✅ **SongPlayerStore**
- Getters reference userStore.currentUser.data
- Actions modify userStore data directly
- Audio files per user

✅ **Components**
- No changes needed - stores work transparently
- User switching works without reload

## Testing

### Verify User Switching
1. Create User A, add some trainings
2. Create User B, add different trainings
3. Switch between A and B
4. Verify each user sees their own trainings
5. Add data to B, switch to A, switch back to B
6. Verify B's new data is preserved

### Verify Persistence
1. Add data for a user
2. Reload the application
3. Verify user's data is still there
4. Switch users and reload
5. Verify correct user is active

### Verify Reactivity
1. Open two components that show training data
2. Add a training in one component
3. Verify it appears in the other component
4. Switch users
5. Verify both components update instantly

## Future Enhancements

### Potential Improvements
1. **Backend Sync**: Sync user data to server
2. **Undo/Redo**: Track changes to user.data
3. **Real-time Collaboration**: Share user data between instances
4. **Data Validation**: Schema validation for user.data
5. **Compression**: Compress user data in localStorage
6. **Encryption**: Encrypt sensitive user data

### Scalability
- Current architecture scales well with more stores
- Adding new user data fields is straightforward
- Store getters can be composed for complex queries
- Performance remains good with reasonable data sizes

## Troubleshooting

### Data Not Updating
- Check if store getter is computed, not a static property
- Verify userStore.saveUsersToStorage() is called after changes
- Ensure currentUserId is set correctly

### Data Lost on Switch
- Verify user.data structure is complete
- Check if saveUsersToStorage() is called before switch
- Ensure localStorage quota is not exceeded

### Components Not Updating
- Check if component is using store getter, not a local copy
- Verify Vue reactivity is not broken (avoid direct array index assignment)
- Use this.$forceUpdate() as last resort if needed

## Conclusion

This architecture provides a clean, maintainable, and performant way to manage user-specific data. By making userStore the single source of truth and having other stores reference it directly, we achieve true reactivity and eliminate synchronization complexity.
