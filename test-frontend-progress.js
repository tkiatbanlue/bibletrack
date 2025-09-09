// Test script to verify frontend progress saving
import { db } from './src/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

async function testFrontendProgressSaving() {
  try {
    console.log('Testing frontend progress saving...');
    
    // Mock user ID (in a real app, this would come from authentication)
    const userId = 'test-user-' + Date.now();
    
    console.log(`Testing with user ID: ${userId}`);
    
    // Test 1: Add progress document
    console.log('Adding progress document...');
    const docRef = await addDoc(collection(db, 'progress'), {
      user_id: userId,
      book: 'Genesis',
      chapter: 1,
      completed_at: new Date()
    });
    
    console.log('✅ Progress document added with ID:', docRef.id);
    
    // Test 2: Query progress documents
    console.log('Querying progress documents...');
    const progressQuery = query(
      collection(db, 'progress'),
      where('user_id', '==', userId)
    );
    
    const querySnapshot = await getDocs(progressQuery);
    console.log(`✅ Found ${querySnapshot.size} progress documents`);
    
    if (querySnapshot.size > 0) {
      console.log('🎉 Frontend progress saving is working correctly!');
      
      // Clean up test data
      console.log('Note: In a real app, you would need to be authenticated to delete documents');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Frontend progress saving test failed:', error.message);
    return false;
  }
}

// Run the test
testFrontendProgressSaving();