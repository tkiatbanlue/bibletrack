# Firebase Firestore Rules Update Instructions

## Problem
The application is showing a "Missing or insufficient permissions" error when trying to save progress. This is because the Firestore security rules are not properly configured to allow authenticated users to write to the database.

## Solution
You need to update the Firestore security rules in the Firebase Console.

## Steps to Update Firestore Rules

1. Go to the Firebase Console: https://console.firebase.google.com/
2. Select your project: "bibletrack-e08ce"
3. In the left sidebar, click on "Firestore Database"
4. Click on the "Rules" tab
5. Replace the existing rules with the following:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      // Allow users to read and write their own document
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Allow users to read other users' public data (for leaderboard)
      allow read: if request.auth != null;
    }
    
    // Progress collection
    match /progress/{progressId} {
      // Allow users to create progress documents with their user_id
      allow create: if request.auth != null && 
                     request.resource.data.user_id == request.auth.uid;
      
      // Allow users to read progress documents (needed for loading progress)
      allow read: if request.auth != null;
      
      // Allow users to update their own progress documents
      allow update: if request.auth != null && 
                     resource.data.user_id == request.auth.uid;
      
      // Allow users to delete their own progress documents
      allow delete: if request.auth != null && 
                     resource.data.user_id == request.auth.uid;
    }
  }
}
```

6. Click "Publish" to save the rules

## Verification
After updating the rules:
1. Refresh the application at https://bibletrack.surge.sh
2. Log in or create a new account
3. Try checking/unchecking chapters in the Bible reading checklist
4. Click the "Save Progress" button
5. The changes should now be saved without errors

## Troubleshooting
If you still encounter issues:
1. Check that you're properly logged in to the application
2. Verify that the user document exists in the "users" collection
3. Check the browser console for any additional error messages
4. Make sure you're using the correct Firebase project configuration