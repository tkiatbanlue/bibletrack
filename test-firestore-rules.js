import { db } from './src/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

// Test function to check if we can write to Firestore
async function testFirestoreWrite() {
  try {
    console.log('Testing Firestore write permissions...');
    
    // Try to write a test document
    const docRef = await addDoc(collection(db, 'test'), {
      test: 'data',
      timestamp: new Date()
    });
    
    console.log('Successfully wrote document with ID:', docRef.id);
    
    // Try to read documents
    const querySnapshot = await getDocs(collection(db, 'test'));
    console.log('Successfully read', querySnapshot.size, 'documents from test collection');
    
    return true;
  } catch (error) {
    console.error('Firestore permission test failed:', error);
    return false;
  }
}

// Run the test
testFirestoreWrite();