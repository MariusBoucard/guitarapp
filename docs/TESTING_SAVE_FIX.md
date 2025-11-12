# Testing the Save-on-Exit Fix

## Quick Test Steps

### Test 1: Basic Save (2 minutes)

1. **Start the app:**

   ```powershell
   npm run dev
   ```

2. **Add test data:**
   - Click "User Management" or sidebar
   - Create a new user (e.g., "Test User")
   - Create a training (e.g., "Test Training")
   - Add an audio file to the training

3. **Close the app:**
   - Click the X button to close
   - **Watch the console output**

4. **What to look for in console:**

   ```
   📦 App is quitting - requesting data save...
   📦 App is closing - saving data...
   ✅ User data saved successfully
   📥 Received save-complete signal from renderer
   ✅ Cleanup complete - quitting now
   ```

5. **Restart the app:**

   ```powershell
   npm run dev
   ```

6. **Verify:**
   - Open User Management
   - "Test User" should still exist
   - "Test Training" should still be there
   - Audio file should still be in the training

### Test 2: Multiple Users (3 minutes)

1. **Create 2 users:**
   - User A: Add training "Jazz"
   - User B: Add training "Rock"

2. **Switch between users:**
   - Verify each user sees only their trainings

3. **Close app and reopen**

4. **Verify:**
   - Both users still exist
   - Each user still has their own trainings

### Test 3: Rapid Close (1 minute)

1. **Add data**
2. **Immediately close app** (don't wait)
3. **Reopen**
4. **Verify data is there**

This tests that the save happens fast enough.

## What Success Looks Like

### Console Output (Good ✅)

```
📦 App is quitting - requesting data save...
📦 App is closing - saving data...
✅ User data saved successfully
📥 Received save-complete signal from renderer
✅ Cleanup complete - quitting now
```

### Console Output (Also OK ✅)

```
📦 App is quitting - requesting data save...
⏱️  Save timeout - proceeding with quit
✅ Cleanup complete - quitting now
```

_This means save took > 2 seconds, but app still quit gracefully_

### Console Output (Problem ❌)

```
[no save messages at all]
Erreur: le processus "17796" est introuvable.
```

_If you see this, the quit handler didn't register_

## Troubleshooting

### Problem: No save messages in console

**Check 1:** Is the console open?

- Press F12 to open DevTools
- Look in the main console tab

**Check 2:** Is electronAPI available?

- In DevTools console, type: `window.electronAPI`
- Should show object with methods
- If `undefined`, preload script isn't loading

**Check 3:** Is the handler registered?

- Look for: `✅ Registered app quit handler`
- Should appear right after app starts

### Problem: Data not saved

**Check localStorage:**

1. Open DevTools (F12)
2. Go to "Application" tab (or "Storage" in some browsers)
3. Click "Local Storage" → file://
4. Look for `guitarapp_users`
5. Should contain JSON with your data

**Manual check in console:**

```javascript
JSON.parse(localStorage.getItem('guitarapp_users'))
```

Should show your users array.

### Problem: App hangs on close

**If app doesn't close after 5 seconds:**

- This shouldn't happen (2 second timeout)
- Check console for error messages
- Force close: Ctrl+C in terminal or Task Manager

**Then report:**

- What console messages you saw
- What you were doing when you tried to close
- Any error messages

## Advanced Testing

### Test localStorage directly

**Save some data, then in DevTools console:**

```javascript
// Check if data exists
const users = JSON.parse(localStorage.getItem('guitarapp_users'))
console.log('Users:', users)

// Check current user
const currentUserId = users.currentUserId
const currentUser = users.users.find((u) => u.id === currentUserId)
console.log('Current user:', currentUser.name)

// Check trainings
console.log('Trainings:', currentUser.data.trainings)

// Check audio files
const training = currentUser.data.trainings[0]
console.log('Audio files in first training:', training.audioFiles)
```

### Test timeout behavior

**Force a slow save (developer testing only):**

In `App.vue`, modify `handleBeforeQuit`:

```javascript
const handleBeforeQuit = async () => {
  console.log('📦 App is closing - saving data...')

  // TESTING: Add artificial delay
  await new Promise((resolve) => setTimeout(resolve, 3000)) // 3 second delay

  userStore.saveUsersToStorage()
  await window.electronAPI.saveComplete()
}
```

Expected: App should quit after 2 seconds with timeout message.

**Remember to remove the delay after testing!**

## Success Criteria

✅ **Data saves when closing app**  
✅ **Console shows save messages**  
✅ **Data persists after restart**  
✅ **Multiple users save correctly**  
✅ **Rapid close still saves data**  
✅ **No "process not found" errors**

## If All Tests Pass

You're good to go! The app now:

- Saves all user data before quitting
- Handles errors gracefully
- Has timeout protection
- Works reliably

## If Tests Fail

Create an issue with:

1. Which test failed
2. Console output (copy/paste)
3. Steps to reproduce
4. Expected vs actual behavior

---

## Quick Reference

**Start app:**

```powershell
npm run dev
```

**Build app:**

```powershell
npm run build
```

**Check localStorage:**

```javascript
JSON.parse(localStorage.getItem('guitarapp_users'))
```

**Console messages to look for:**

- 📦 App is closing
- ✅ User data saved
- 📥 Received save-complete
- ✅ Cleanup complete

Good luck testing! 🧪
