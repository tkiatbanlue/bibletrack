import { db } from './src/firebase';
import { collection, addDoc } from 'firebase/firestore';

async function testProgressSave() {
  try {
    console.log('Testing progress save without authentication...');
    
    // Try to save a progress document without authentication
    const docRef = await addDoc(collection(db, 'progress'), {
      user_id: 'test-user-id',
      book: 'Genesis',
      chapter: 1,
      completed_at: new Date()
    });
    
    console.log('Success! Document saved with ID:', docRef.id);
    return true;
  } catch (error) {
    console.error('Error saving progress:', error.message);
    console.error('Error code:', error.code);
    return false;
  }
}

testProgressSave();