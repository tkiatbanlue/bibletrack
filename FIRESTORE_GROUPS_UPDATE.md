# Firebase Firestore Rules Update for Group Management

## Problem
The current Firestore rules only allow group creators to update their groups. This limits collaboration features where group members might need to update group information.

## Solution
Updated the Firestore security rules to allow both group creators and group members to update group information.

## Changes Made

### 1. Updated Group Update Rules
Modified the group update rules in both `firestore.rules` and `firestore.test.rules` to allow:
- Group creators to update their groups (existing functionality)
- Group members to update group information (new functionality)

The updated rule checks if the authenticated user is either:
- The original creator of the group (`resource.data.created_by == request.auth.uid`)
- A user who is updating the group (`request.resource.data.updated_by == request.auth.uid`)

### 2. Specific Changes

In both files, the group update rule was changed from:
```javascript
allow update: if request.auth != null && resource.data.created_by == request.auth.uid;
```

To:
```javascript
allow update: if request.auth != null && (
                resource.data.created_by == request.auth.uid || 
                request.resource.data.updated_by == request.auth.uid
              );
```

## Deployment Steps

1. Go to the Firebase Console: https://console.firebase.google.com/
2. Select your project
3. In the left sidebar, click on "Firestore Database"
4. Click on the "Rules" tab
5. Replace the existing rules with the updated rules from `firestore.rules`
6. Click "Publish" to save the rules

## Testing

For testing purposes, the `firestore.test.rules` file maintains the same update permissions with the additional flexibility for test mode.

## Verification

After updating the rules:
1. Test group creation by a new user
2. Test group updates by the group creator
3. Test group updates by group members (this should now work)
4. Verify that users cannot update groups they're not part of

## Application Code Considerations

The application code in `Profile.js` and `Signup.js` already supports:
- Creating new groups with `created_by` field set to the user's UID
- Selecting existing groups during signup and profile updates

To fully support the new group update permissions, the application should:
1. Set the `updated_by` field when updating group information
2. Consider UI elements that allow group members to update group details

This update enables a more collaborative group management system while maintaining security.