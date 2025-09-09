
require('dotenv').config();

const { db } = require('./firebase');
const { collection, getDocs } = require('firebase/firestore');

console.log('db object:', db);

async function readProgress() {
  try {
    console.log('Reading progress collection...');
    const querySnapshot = await getDocs(collection(db, 'progress'));
    querySnapshot.forEach((doc) => {
      console.log(`${doc.id} => ${JSON.stringify(doc.data())}`);
    });
  } catch (error) {
    console.error('Error reading progress collection:', error);
  }
}

readProgress();
