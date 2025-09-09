// Script to check existing Firestore data
const admin = require('firebase-admin');
require('dotenv').config();

// Try to initialize Firebase Admin SDK
try {
  // Try to initialize with default credentials (if running in Google Cloud environment)
  admin.initializeApp({
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID
  });
} catch (error) {
  console.log('⚠️  Could not initialize Firebase Admin with default credentials');
  console.log('Attempting to initialize with service account...\n');
  
  // Initialize Firebase Admin SDK with service account
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

  // Check if we have service account credentials
  if (!serviceAccount.private_key || !serviceAccount.client_email) {
    console.log('❌ Firebase Admin credentials not found.');
    console.log('To check Firestore data, please set up service account credentials:');
    console.log('1. Go to Firebase Console -> Project Settings -> Service Accounts');
    console.log('2. Generate a new private key and download the JSON file');
    console.log('3. Set the following environment variables:');
    console.log('   - FIREBASE_PRIVATE_KEY_ID');
    console.log('   - FIREBASE_PRIVATE_KEY');
    console.log('   - FIREBASE_CLIENT_EMAIL');
    console.log('   - FIREBASE_CLIENT_ID');
    console.log('   - FIREBASE_CLIENT_CERT_URL');
    process.exit(0);
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID
    });
  } catch (initError) {
    console.log('❌ Failed to initialize Firebase Admin SDK:', initError.message);
    process.exit(1);
  }
}

const db = admin.firestore();

async function checkExistingData() {
  console.log('🔍 Checking existing Firestore data...\n');
  
  try {
    // Check if there are any users
    console.log('👥 Checking users collection...');
    const usersSnapshot = await db.collection('users').limit(5).get();
    console.log(`Found ${usersSnapshot.size} user documents`);
    
    if (usersSnapshot.size > 0) {
      console.log('Sample users:');
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`  - ${doc.id}: ${data.email || data.displayName || 'No email/name'}`);
      });
    }
    
    // Check if there are any progress documents
    console.log('\n📋 Checking progress collection...');
    const progressSnapshot = await db.collection('progress').limit(5).get();
    console.log(`Found ${progressSnapshot.size} progress documents`);
    
    if (progressSnapshot.size > 0) {
      console.log('Sample progress documents:');
      progressSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`  - ${doc.id}: ${data.book} ${data.chapter} (User: ${data.user_id})`);
      });
      
      // Count total progress documents
      const totalProgressSnapshot = await db.collection('progress').get();
      console.log(`\n📈 Total progress documents in database: ${totalProgressSnapshot.size}`);
      
      // Group by user
      const userProgress = {};
      totalProgressSnapshot.forEach((doc) => {
        const data = doc.data();
        if (!userProgress[data.user_id]) {
          userProgress[data.user_id] = 0;
        }
        userProgress[data.user_id]++;
      });
      
      console.log('\n📊 Progress documents by user:');
      Object.keys(userProgress).forEach(userId => {
        console.log(`  - User ${userId}: ${userProgress[userId]} chapters`);
      });
    }
    
    console.log('\n✅ Firestore data check completed!');
    
  } catch (error) {
    console.error('❌ Error checking Firestore data:', error.message);
    
    if (error.code === 'permission-denied') {
      console.log('\n⚠️  Permission denied. This script needs Firebase Admin credentials to read all data.');
      console.log('The application itself works with authenticated users through the UI.');
    }
  }
}

// Run the check
checkExistingData();