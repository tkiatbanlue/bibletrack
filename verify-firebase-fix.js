// Test script to verify Firebase authentication and progress saving
const admin = require('firebase-admin');
require('dotenv').config();

console.log('Testing Firebase authentication with updated credentials...');

// Check if we have service account credentials
const hasCredentials = process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL;

if (!hasCredentials) {
  console.log('❌ Firebase Admin credentials still missing.');
  console.log('Please ensure your .env file contains:');
  console.log('- FIREBASE_PRIVATE_KEY');
  console.log('- FIREBASE_CLIENT_EMAIL');
  process.exit(1);
}

try {
  // Initialize Firebase Admin SDK
  const serviceAccount = {
    "type": "service_account",
    "project_id": process.env.REACT_APP_FIREBASE_PROJECT_ID,
    "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
    "private_key": process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    "client_email": process.env.FIREBASE_CLIENT_EMAIL,
    "client_id": process.env.FIREBASE_CLIENT_ID,
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": process.env.FIREBASE_CLIENT_CERT_URL
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID
  });

  const db = admin.firestore();
  
  console.log('✅ Firebase Admin SDK initialized successfully!');
  
  // Test progress saving
  async function testProgressSaving() {
    try {
      console.log('\n=== Testing Progress Saving ===');
      
      // Test user
      const testUser = {
        uid: 'test-user-' + Date.now(),
        email: 'test@example.com',
        displayName: 'Test User'
      };
      
      console.log(`🧪 Testing with user ID: ${testUser.uid}`);
      
      // Test 1: Add progress documents
      console.log('\n📝 Adding progress document...');
      const docRef = await db.collection('progress').add({
        user_id: testUser.uid,
        book: 'Genesis',
        chapter: 1,
        completed_at: new Date()
      });
      
      console.log('✅ Progress document added successfully with ID:', docRef.id);
      
      // Test 2: Query progress documents
      console.log('\n🔍 Querying progress documents...');
      const querySnapshot = await db.collection('progress')
        .where('user_id', '==', testUser.uid)
        .get();
      
      console.log(`✅ Found ${querySnapshot.size} progress documents for user`);
      
      if (querySnapshot.size > 0) {
        console.log('🎉 Progress saving is working correctly!');
        
        // Clean up test data
        console.log('\n🧹 Cleaning up test data...');
        const batch = db.batch();
        querySnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        console.log('✅ Test data cleaned up.');
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Test FAILED with error:', error.message);
      return false;
    }
  }
  
  testProgressSaving().then(success => {
    if (success) {
      console.log('\n✅ All tests passed! Firebase progress saving is now working.');
    } else {
      console.log('\n❌ Tests failed. Please check your configuration.');
    }
  });

} catch (error) {
  console.error('❌ Firebase Admin SDK initialization failed:', error.message);
  process.exit(1);
}