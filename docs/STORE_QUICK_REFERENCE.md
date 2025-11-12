# Quick Reference: User-Centric Store Architecture

## Core Concept

**userStore** owns all data → Other stores **reference** it via getters → Actions **modify** user data directly

## Adding New User Data

### 1. Add to User Data Structure (userStore.js)

```javascript
state: () => ({
  users: [
    {
      data: {
        // ... existing fields
        myNewData: [], // ← Add here
      },
    },
  ],
})
```

### 2. Update createUser() Method (userStore.js)

```javascript
createUser(userName, email = '', avatar = '') {
  const newUser = {
    data: {
      // ... existing fields
      myNewData: []  // ← Add here
    }
  }
}
```

### 3. Create Store with Getters (myNewStore.js)

```javascript
import { defineStore } from 'pinia'
import { useUserStore } from './userStore'

export const useMyNewStore = defineStore('myNew', {
  state: () => ({
    // Only UI state here, not user data
    selectedItem: 0,
  }),

  getters: {
    // Reference user data
    myNewData() {
      const userStore = useUserStore()
      if (!userStore.currentUser?.data?.myNewData) {
        if (userStore.currentUser) {
          userStore.currentUser.data.myNewData = []
        }
        return []
      }
      return userStore.currentUser.data.myNewData
    },
  },

  actions: {
    // Modify user data directly
    addItem(item) {
      const userStore = useUserStore()
      if (!userStore.currentUser) return

      userStore.currentUser.data.myNewData.push(item)
      userStore.saveUsersToStorage()
    },

    removeItem(index) {
      const userStore = useUserStore()
      if (!userStore.currentUser) return

      userStore.currentUser.data.myNewData.splice(index, 1)
      userStore.saveUsersToStorage()
    },
  },
})
```

## Using Stores in Components

### Reading Data (Always Current)

```vue
<template>
  <div v-for="training in trainingStore.trainingList" :key="training.id">
    {{ training.name }}
  </div>
</template>

<script>
  import { useTrainingStore } from '@/stores/trainingStore'

  export default {
    setup() {
      const trainingStore = useTrainingStore()
      // trainingStore.trainingList is a getter that references user data
      // It automatically updates when user switches
      return { trainingStore }
    },
  }
</script>
```

### Modifying Data

```javascript
// In component
const trainingStore = useTrainingStore()

// Add training - modifies userStore.currentUser.data.trainings
trainingStore.addTraining('New Training')

// Data is automatically:
// 1. Added to current user's data
// 2. Saved to localStorage
// 3. Visible in all components
// 4. Persisted across user switches
```

## Common Patterns

### Pattern 1: List Management

```javascript
// Getter returns reference to user's list
getters: {
  itemList() {
    const userStore = useUserStore()
    return userStore.currentUser?.data?.items || []
  }
}

// Actions modify user's list
actions: {
  addItem(item) {
    const userStore = useUserStore()
    userStore.currentUser.data.items.push(item)
    userStore.saveUsersToStorage()
  }
}
```

### Pattern 2: Selected Item (UI State)

```javascript
state: () => ({
  selectedItemId: 0  // UI state, not user data
}),

getters: {
  itemList() {
    // User data
    return userStore.currentUser?.data?.items || []
  },

  selectedItem(state) {
    // Derived from UI state + user data
    return this.itemList.find(item => item.id === state.selectedItemId)
  }
}
```

### Pattern 3: Nested Data

```javascript
// User data structure
data: {
  trainings: [
    {
      id: 0,
      name: 'Training',
      videos: [],      // ← Nested array
      audioFiles: []   // ← Nested array
    }
  ]
}

// Access nested data
actions: {
  addVideoToTraining(trainingId, video) {
    const userStore = useUserStore()
    const training = userStore.currentUser.data.trainings
      .find(t => t.id === trainingId)

    if (training) {
      training.videos.push(video)  // Direct mutation
      userStore.saveUsersToStorage()
    }
  }
}
```

## Data Flow Checklist

### When Adding Data ✅

1. Action modifies `userStore.currentUser.data`
2. Call `userStore.saveUsersToStorage()`
3. Getter automatically returns updated data
4. Components re-render automatically

### When Switching Users ✅

1. Call `userStore.switchUser(userId)`
2. `currentUserId` changes
3. All getters return new user's data
4. Components re-render automatically
5. No manual synchronization needed

### When Reading Data ✅

1. Use getter (not direct state access)
2. Getter references `userStore.currentUser.data`
3. Always get current user's data
4. Reactivity preserved

## Migration Guide

### Convert Existing Store

**Before (Old Architecture):**

```javascript
// Bad: Store owns data
state: () => ({
  items: []
}),
actions: {
  addItem(item) {
    this.items.push(item)
    localStorage.setItem('items', JSON.stringify(this.items))
  }
}
```

**After (New Architecture):**

```javascript
// Good: Store references user data
import { useUserStore } from './userStore'

getters: {
  items() {
    const userStore = useUserStore()
    return userStore.currentUser?.data?.items || []
  }
},
actions: {
  addItem(item) {
    const userStore = useUserStore()
    userStore.currentUser.data.items.push(item)
    userStore.saveUsersToStorage()
  }
}
```

## Debugging Tips

### Check Current User

```javascript
const userStore = useUserStore()
console.log('Current user:', userStore.currentUser.name)
console.log('User data:', userStore.currentUser.data)
```

### Check if Data Updates

```javascript
// Add data
trainingStore.addTraining('Test')

// Check if it's in user data
console.log(userStore.currentUser.data.trainings)
// Should show the new training
```

### Check if Getter Works

```javascript
// Compare getter vs direct access
console.log('Getter:', trainingStore.trainingList)
console.log('Direct:', userStore.currentUser.data.trainings)
// Should be identical
```

### Check if Switch Works

```javascript
// Before switch
console.log('User A trainings:', trainingStore.trainingList)

// Switch user
userStore.switchUser('user_b_id')

// After switch
console.log('User B trainings:', trainingStore.trainingList)
// Should show different trainings
```

## Common Mistakes to Avoid

### ❌ Don't: Store User Data in Store State

```javascript
// Bad
state: () => ({
  userItems: [], // ← Wrong: This is per-user data
})
```

### ✅ Do: Reference User Data via Getter

```javascript
// Good
getters: {
  userItems() {
    return userStore.currentUser?.data?.items || []
  }
}
```

### ❌ Don't: Copy User Data

```javascript
// Bad
actions: {
  loadData() {
    this.items = [...userStore.currentUser.data.items]
  }
}
```

### ✅ Do: Reference Directly

```javascript
// Good
getters: {
  items() {
    return userStore.currentUser?.data?.items || []
  }
}
```

### ❌ Don't: Forget to Save

```javascript
// Bad
actions: {
  addItem(item) {
    userStore.currentUser.data.items.push(item)
    // ← Missing: userStore.saveUsersToStorage()
  }
}
```

### ✅ Do: Always Save After Changes

```javascript
// Good
actions: {
  addItem(item) {
    userStore.currentUser.data.items.push(item)
    userStore.saveUsersToStorage()  // ← Save!
  }
}
```

## Summary

| Aspect                | Implementation                   |
| --------------------- | -------------------------------- |
| **Data Storage**      | `userStore.users[].data`         |
| **Data Access**       | Computed getters                 |
| **Data Modification** | Direct mutation + save           |
| **User Switching**    | Change `currentUserId`           |
| **Persistence**       | `userStore.saveUsersToStorage()` |
| **Reactivity**        | Automatic via Vue                |

**Key Takeaway**: Think of other stores as **views** into `userStore.currentUser.data`, not as separate data containers.
