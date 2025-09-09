// Test script to verify progress saving with proper authentication
const admin = require('firebase-admin');
require('dotenv').config();

// Firebase Admin SDK initialization
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

console.log('Checking Firebase Admin credentials...');

// Check if we have service account credentials
if (!serviceAccount.private_key || !serviceAccount.client_email) {
  console.log('⚠️  Firebase Admin credentials not found.');
  console.log('This is likely why progress saving is not working.');
  console.log('You need to add Firebase service account credentials to your environment variables.');
  
  console.log('\nTo fix this issue:');
  console.log('1. Go to Firebase Console > Project Settings > Service Accounts');
  console.log('2. Generate a new private key (JSON file)');
  console.log('3. Add the following environment variables to your .env file:');
  console.log('   FIREBASE_PRIVATE_KEY_ID=your_private_key_id');
  console.log('   FIREBASE_PRIVATE_KEY=your_private_key (with proper escaping)');
  console.log('   FIREBASE_CLIENT_EMAIL=your_client_email');
  console.log('   FIREBASE_CLIENT_ID=your_client_id');
  console.log('   FIREBASE_CLIENT_CERT_URL=your_client_cert_url');
  
  process.exit(1);
}

console.log('✅ Firebase Admin credentials found.');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID
});

const db = admin.firestore();

async function testProgressSaving() {
  console.log('\n=== Testing Progress Saving ===');
  
  try {
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
      console.log('\n🔧 SOLUTION:');
      console.log('The issue is that your application needs Firebase Admin credentials to work properly.');
      console.log('Add the required service account credentials to your environment variables.');
      
      // Clean up test data
      console.log('\n🧹 Cleaning up test data...');
      const batch = db.batch();
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log('✅ Test data cleaned up.');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Test FAILED with error:', error.message);
    return false;
  }
}

testProgressSaving();