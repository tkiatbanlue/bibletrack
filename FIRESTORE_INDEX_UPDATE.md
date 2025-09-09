# Firebase Firestore Index Update Instructions

## Problem
The application is showing Firestore index errors because compound queries require specific indexes to be created in Firestore. The error message provides a link to create the index, but we need to create several indexes for all the features to work properly.

## Required Indexes

### 1. Streak Tracker Index
**Collection**: progress
**Query**: 
- where('user_id', '==', user.uid)
- orderBy('completed_at', 'desc')

### 2. Rising Stars Index
**Collection**: progress
**Query**: 
- where('user_id', '==', user.id)
- where('completed_at', '>=', sevenDaysAgo)

### 3. Leaderboard Index
**Collection**: users
**Query**: 
- where('class_year', '==', classYear)
- orderBy('chapters_read_count', 'desc')

## Steps to Create Indexes

### Method 1: Using Firebase Console Links (Recommended)
When you encounter an error in the browser console, Firebase provides a direct link to create the required index. Click on the link in the error message to automatically create the index.

Example error message:
```
Error calculating streak: FirebaseError: The query requires an index. You can create it here: https://console.firebase.google.com/v1/r/project/bibletrack-e08ce/firestore
```

### Method 2: Manual Index Creation
1. Go to the Firebase Console: https://console.firebase.google.com/
2. Select your project: "bibletrack-e08ce"
3. In the left sidebar, click on "Firestore Database"
4. Click on the "Indexes" tab
5. Click "Create index"

For each index, set the following parameters:

#### Index 1: Streak Tracker
- **Collection ID**: progress
- **Index type**: Single field or Composite (select composite)
- **Fields**:
  1. Field path: user_id, Query scope: Ascending
  2. Field path: completed_at, Query scope: Descending
- **Query scope**: Collection

#### Index 2: Rising Stars
- **Collection ID**: progress
- **Index type**: Composite
- **Fields**:
  1. Field path: user_id, Query scope: Ascending
  2. Field path: completed_at, Query scope: Ascending
- **Query scope**: Collection

#### Index 3: Leaderboard
- **Collection ID**: users
- **Index type**: Composite
- **Fields**:
  1. Field path: class_year, Query scope: Ascending
  2. Field path: chapters_read_count, Query scope: Descending
- **Query scope**: Collection

## Index Creation Time
After creating an index, it may take a few minutes for the index to finish building. During this time, queries that require the index may still fail.

## Verification
After creating the indexes:
1. Refresh the application at https://bibletrack.surge.sh
2. Log in to the application
3. Navigate to the main dashboard where the streak tracker is displayed
4. The streak count should load without errors
5. Check the leaderboard and rising stars sections to ensure they load properly

## Troubleshooting
If you still encounter index errors:
1. Check that all three indexes have been created
2. Wait a few minutes for indexes to finish building
3. Check the Firebase Console for any index build errors
4. Verify that the field names in your queries match exactly with the index field names
5. Make sure you're using the correct collection names

## Additional Notes
- Firebase automatically creates single-field indexes for all fields, but composite indexes must be created manually
- Indexes are specific to the collection and field combination
- Queries with multiple where clauses require composite indexes
- OrderBy clauses also require appropriate indexes when combined with where clauses