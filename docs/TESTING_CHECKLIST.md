# User Management System - Testing Checklist

## Pre-Test Setup

- [ ] Build completed successfully: `npm run build:vite`
- [ ] No compilation errors
- [ ] Application starts without errors

## Test 1: Basic User Creation

### Steps:

1. [ ] Open the application
2. [ ] Click "👤 User Management" in sidebar
3. [ ] Click "➕ New User"
4. [ ] Enter name: "Test User A"
5. [ ] Enter email: "testa@example.com"
6. [ ] Click "Create"

### Expected Results:

- [ ] User "Test User A" appears in user list
- [ ] User card shows correct name and email
- [ ] Success message displayed
- [ ] User becomes active (highlighted)

## Test 2: Add Data to User A

### Steps:

1. [ ] Ensure "Test User A" is active
2. [ ] Close user management panel
3. [ ] Go to Training/Playlist section
4. [ ] Create a new training: "User A Training 1"
5. [ ] Create another training: "User A Training 2"
6. [ ] Add some videos to trainings (if applicable)

### Expected Results:

- [ ] Trainings appear in the list
- [ ] Trainings are saved (persist on page operations)

## Test 3: Create Second User

### Steps:

1. [ ] Open "👤 User Management"
2. [ ] Click "➕ New User"
3. [ ] Enter name: "Test User B"
4. [ ] Enter email: "testb@example.com"
5. [ ] Click "Create"

### Expected Results:

- [ ] User "Test User B" appears in user list
- [ ] User card shows correct name and email
- [ ] Success message displayed

## Test 4: Add Data to User B

### Steps:

1. [ ] Ensure "Test User B" is active
2. [ ] Close user management panel
3. [ ] Create a new training: "User B Training 1"
4. [ ] Create another training: "User B Training 2"

### Expected Results:

- [ ] Only User B's trainings are visible
- [ ] User A's trainings are NOT visible
- [ ] New trainings are saved

## Test 5: Switch Between Users (Critical Test)

### Steps:

1. [ ] Open "👤 User Management"
2. [ ] Current user should be "Test User B"
3. [ ] Click "🔄 Switch" on "Test User A"
4. [ ] Wait for success message
5. [ ] **Do NOT reload the page**
6. [ ] Check training list

### Expected Results:

- [ ] Success message: "Switched user successfully - all stores updated"
- [ ] **NO page reload occurs**
- [ ] User A becomes active in user management
- [ ] Training list shows User A's trainings ("User A Training 1", "User A Training 2")
- [ ] User B's trainings are NOT visible

## Test 6: Switch Back to User B

### Steps:

1. [ ] Open "👤 User Management"
2. [ ] Click "🔄 Switch" on "Test User B"
3. [ ] Check training list

### Expected Results:

- [ ] User B becomes active
- [ ] Training list shows User B's trainings ("User B Training 1", "User B Training 2")
- [ ] User A's trainings are NOT visible
- [ ] **NO page reload occurs**

## Test 7: Verify Data Persistence After Reload

### Steps:

1. [ ] Ensure "Test User A" is active
2. [ ] Reload the page (F5 or Ctrl+R)
3. [ ] Check which user is active
4. [ ] Check training list

### Expected Results:

- [ ] User A is still active after reload
- [ ] User A's trainings are still visible
- [ ] No data loss

## Test 8: Switch Users After Reload

### Steps:

1. [ ] After reload, open "👤 User Management"
2. [ ] Switch to "Test User B"
3. [ ] Check training list

### Expected Results:

- [ ] User B becomes active
- [ ] User B's trainings are visible
- [ ] User A's trainings are NOT visible

## Test 9: Modify Data for Current User

### Steps:

1. [ ] Ensure "Test User B" is active
2. [ ] Add a new training: "User B Training 3"
3. [ ] Open "👤 User Management"
4. [ ] Switch to "Test User A"
5. [ ] Switch back to "Test User B"

### Expected Results:

- [ ] "User B Training 3" is still there
- [ ] Data was saved correctly
- [ ] All three User B trainings are visible

## Test 10: User Export

### Steps:

1. [ ] Ensure "Test User A" is active
2. [ ] Open "👤 User Management"
3. [ ] Click "💾 Export" on "Test User A"
4. [ ] Check downloads folder

### Expected Results:

- [ ] JSON file downloaded: "test-user-a_YYYY-MM-DD.json"
- [ ] Success message displayed
- [ ] File contains user data

## Test 11: User Import

### Steps:

1. [ ] Open "👤 User Management"
2. [ ] Click "📥 Import User"
3. [ ] Select the exported JSON file from Test 10
4. [ ] Choose import option (create new or overwrite)
5. [ ] Check user list

### Expected Results:

- [ ] User imported successfully
- [ ] Success message displayed
- [ ] Imported user appears in list with data
- [ ] Can switch to imported user and see data

## Test 12: Delete User

### Steps:

1. [ ] Ensure at least 2 users exist
2. [ ] Open "👤 User Management"
3. [ ] Click "🗑️ Delete" on a non-active user
4. [ ] Confirm deletion

### Expected Results:

- [ ] User removed from list
- [ ] Success message displayed
- [ ] Cannot delete the only remaining user
- [ ] Active user is preserved

## Test 13: Edit User Profile

### Steps:

1. [ ] Open "👤 User Management"
2. [ ] Click "✏️ Edit" on any user
3. [ ] Change name to "Modified User Name"
4. [ ] Change email to "modified@example.com"
5. [ ] Click "Save"

### Expected Results:

- [ ] User card shows updated name and email
- [ ] Success message displayed
- [ ] Changes persist after reload

## Test 14: Clone User

### Steps:

1. [ ] Ensure "Test User A" has some trainings
2. [ ] Open "👤 User Management"
3. [ ] Click "📋 Clone" on "Test User A"
4. [ ] Enter name for clone: "Cloned User A"
5. [ ] Click "Clone"

### Expected Results:

- [ ] New user "Cloned User A" appears
- [ ] Switch to cloned user
- [ ] Cloned user has same trainings as User A
- [ ] Modifying cloned user's data doesn't affect User A

## Test 15: Multiple Components Reactivity

### Steps:

1. [ ] Ensure you can see training list
2. [ ] Open a component that also shows training data (if multiple exist)
3. [ ] Switch users via "👤 User Management"

### Expected Results:

- [ ] **All components update simultaneously**
- [ ] No component shows stale data
- [ ] No manual refresh needed

## Test 16: Video Data Per User

### Steps:

1. [ ] Switch to "Test User A"
2. [ ] Add some videos to video library (if applicable)
3. [ ] Switch to "Test User B"
4. [ ] Add different videos to video library

### Expected Results:

- [ ] Each user has their own video list
- [ ] Switching users shows correct videos
- [ ] No data mixing between users

## Test 17: Audio Data Per User

### Steps:

1. [ ] Switch to "Test User A"
2. [ ] Add audio files (if applicable)
3. [ ] Switch to "Test User B"
4. [ ] Add different audio files

### Expected Results:

- [ ] Each user has their own audio files
- [ ] Switching users shows correct audio files
- [ ] No data mixing between users

## Test 18: Settings Per User (if implemented)

### Steps:

1. [ ] Switch to "Test User A"
2. [ ] Change some settings (display options, etc.)
3. [ ] Switch to "Test User B"
4. [ ] Change settings differently
5. [ ] Switch back to "Test User A"

### Expected Results:

- [ ] User A's settings are preserved
- [ ] User B has their own settings
- [ ] Settings switch correctly with users

## Test 19: Large Data Set

### Steps:

1. [ ] Create a user
2. [ ] Add 20+ trainings
3. [ ] Add videos to each training
4. [ ] Switch to another user
5. [ ] Switch back

### Expected Results:

- [ ] All data loads correctly
- [ ] No performance issues
- [ ] Switching remains fast
- [ ] No data corruption

## Test 20: Edge Cases

### Edge Case 1: Empty User

- [ ] Create user, don't add any data
- [ ] Switch to another user
- [ ] Switch back to empty user
- [ ] Result: No errors, empty state shown correctly

### Edge Case 2: Special Characters in Names

- [ ] Create user with name: "Test 🎸 User"
- [ ] Create user with name: "O'Brien"
- [ ] Result: Names display correctly, no errors

### Edge Case 3: Very Long Names

- [ ] Create user with 50+ character name
- [ ] Result: Name displays correctly (may truncate with ellipsis)

## Performance Checks

### Memory Usage

- [ ] Open DevTools → Memory
- [ ] Switch between users 10 times
- [ ] Check for memory leaks
- [ ] Result: Memory usage should be stable

### Load Time

- [ ] Measure time to switch users
- [ ] Should be instant (< 100ms)
- [ ] No noticeable delay

### Storage Size

- [ ] Open DevTools → Application → Local Storage
- [ ] Check size of `guitarapp_users`
- [ ] Should be reasonable for data amount

## Bug Report Template

If any test fails, document:

```
Test Number: [e.g., Test 5]
Test Name: [e.g., Switch Between Users]
Step Failed: [e.g., Step 4]
Expected: [e.g., User A's trainings visible]
Actual: [e.g., No trainings visible]
Console Errors: [Copy any errors from browser console]
Screenshots: [Attach if helpful]
Steps to Reproduce:
1.
2.
3.
```

## Success Criteria

All tests must pass with:

- [ ] No JavaScript errors in console
- [ ] No network errors
- [ ] No data loss
- [ ] No page reloads required
- [ ] Instant user switching
- [ ] Correct data isolation between users
- [ ] Data persists across reloads
- [ ] Import/export works correctly
- [ ] All components update reactively

## Post-Test Cleanup

After testing:

- [ ] Delete test users
- [ ] Clear test data
- [ ] Verify application still works
- [ ] Document any issues found
- [ ] Report results

---

## Quick Smoke Test (5 minutes)

If short on time, run this minimal test:

1. [ ] Create User A, add data
2. [ ] Create User B, add different data
3. [ ] Switch to User A → verify User A's data shows
4. [ ] Switch to User B → verify User B's data shows
5. [ ] Reload page → verify correct user is active
6. [ ] Export User A → verify file downloads
7. [ ] Delete User B → verify User B is removed

If all pass, core functionality works! ✅
