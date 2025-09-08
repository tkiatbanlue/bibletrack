import { db } from './src/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

// Test function to check if we can write to the progress collection
async function testProgressCollection() {
  try {
    console.log('Testing progress collection write permissions...');
    
    // Try to write a test progress document
    const docRef = await addDoc(collection(db, 'progress'), {
      user_id: 'test-user-id',
      book: 'Genesis',
      chapter: 1,
      completed_at: new Date()
    });
    
    console.log('Successfully wrote progress document with ID:', docRef.id);
    
    // Try to read progress documents
    const progressQuery = query(
      collection(db, 'progress'),
      where('user_id', '==', 'test-user-id')
    );
    
    const querySnapshot = await getDocs(progressQuery);
    console.log('Successfully read', querySnapshot.size, 'progress documents');
    
    return true;
  } catch (error) {
    console.error('Progress collection test failed:', error);
    return false;
  }
}

// Run the test
testProgressCollection();