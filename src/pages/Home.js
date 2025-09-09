import React, { useState, useEffect } from 'react';
import bibleBooks from '../utils/bibleData';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import StreakTracker from '../components/StreakTracker';
import Leaderboard from '../components/Leaderboard';
import RisingStars from '../components/RisingStars';

const Home = ({ user }) => {
  const [expandedBooks, setExpandedBooks] = useState({});
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [pendingChanges, setPendingChanges] = useState({});

  // Toggle book expansion
  const toggleBook = (bookName) => {
    setExpandedBooks(prev => ({
      ...prev,
      [bookName]: !prev[bookName]
    }));
  };

  // Load user progress from Firestore
  useEffect(() => {
    const loadProgress = async () => {
      if (!user) return;
      
      try {
        console.log('Loading progress for user:', user.uid);
        const progressQuery = query(
          collection(db, 'progress'),
          where('user_id', '==', user.uid)
        );
        
        const progressSnapshot = await getDocs(progressQuery);
        console.log('Found progress documents:', progressSnapshot.size);
        
        const progressData = {};
        
        progressSnapshot.forEach(doc => {
          const { book, chapter } = doc.data();
          console.log('Processing progress document:', { book, chapter });
          if (!progressData[book]) {
            progressData[book] = new Set();
          }
          progressData[book].add(chapter);
        });
        
        // Convert Sets to Arrays for easier handling
        Object.keys(progressData).forEach(book => {
          progressData[book] = Array.from(progressData[book]);
        });
        
        console.log('Processed progress data:', progressData);
        setUserProgress(progressData);
      } catch (error) {
        console.error('Error loading progress:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProgress();
  }, [user]);

  // Handle chapter checkbox change
  const handleChapterChange = (bookName, chapterNum, isChecked) => {
    // Update local state immediately for UI responsiveness
    setUserProgress(prev => {
      const newProgress = { ...prev };
      if (isChecked) {
        if (!newProgress[bookName]) {
          newProgress[bookName] = [];
        }
        newProgress[bookName] = [...newProgress[bookName], chapterNum];
      } else {
        if (newProgress[bookName]) {
          newProgress[bookName] = newProgress[bookName].filter(ch => ch !== chapterNum);
        }
      }
      return newProgress;
    });

    // Stage changes to be saved
    setPendingChanges(prev => {
      const newChanges = { ...prev };
      if (!newChanges[bookName]) {
        newChanges[bookName] = {};
      }
      newChanges[bookName][chapterNum] = isChecked;
      return newChanges;
    });
  };

  // Save pending changes to Firestore
  const handleSave = async () => {
    console.log('Saving pending changes:', pendingChanges);
    try {
      for (const bookName in pendingChanges) {
        for (const chapterNum in pendingChanges[bookName]) {
          const isChecked = pendingChanges[bookName][chapterNum];
          const chapter = parseInt(chapterNum);

          if (isChecked) {
            // Add progress record
            await addDoc(collection(db, 'progress'), {
              user_id: user.uid,
              book: bookName,
              chapter: chapter,
              completed_at: new Date()
            });
          } else {
            // Remove progress record
            const progressQuery = query(
              collection(db, 'progress'),
              where('user_id', '==', user.uid),
              where('book', '==', bookName),
              where('chapter', '==', chapter)
            );
            const progressSnapshot = await getDocs(progressQuery);
            progressSnapshot.forEach(async (doc) => {
              await deleteDoc(doc.ref);
            });
          }
        }
      }

      // Clear pending changes after successful save
      setPendingChanges({});
      console.log('All changes saved successfully.');

      // Recalculate and update user's total chapter count
      const newCount = Object.values(userProgress).reduce((total, chapters) => total + chapters.length, 0);
      await updateUserChapterCount(newCount);

    } catch (error) {
      console.error('Error saving changes:', error);
    }
  };

  // Update user's chapter count in Firestore
  const updateUserChapterCount = async (newCount) => {
    try {
      console.log('Updating user chapter count:', { userId: user.uid, newCount });
      await updateDoc(doc(db, 'users', user.uid), {
        chapters_read_count: newCount
      });
      console.log('User chapter count updated successfully');
    } catch (error) {
      console.error('Error updating user chapter count:', error);
    }
  };

  // Check if a chapter is completed
  const isChapterCompleted = (bookName, chapterNum) => {
    return userProgress[bookName] && userProgress[bookName].includes(chapterNum);
  };

  // Calculate overall progress
  const calculateProgress = () => {
    let totalChapters = 0;
    let completedChapters = 0;
    
    bibleBooks.forEach(book => {
      totalChapters += book.chapters;
      completedChapters += (userProgress[book.name] ? userProgress[book.name].length : 0);
    });
    
    return {
      total: totalChapters,
      completed: completedChapters,
      percentage: totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0
    };
  };

  const progress = calculateProgress();

  if (loading) {
    return <div className="loading">Loading your progress...</div>;
  }

  return (
    <div className="home-container">
      <div className="progress-header">
        <h1>Bible Reading Checklist</h1>
        <button onClick={handleSave} className="save-button">Save Progress</button>
        <StreakTracker user={user} />
        <div className="progress-bar-container">
          <div className="progress-info">
            <span>Progress: {progress.completed}/{progress.total} chapters</span>
            <span>{progress.percentage}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress.percentage}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="books-list">
        {bibleBooks.map((book) => (
          <div key={book.name} className="book-item">
            <div 
              className="book-header"
              onClick={() => toggleBook(book.name)}
            >
              <h3>{book.name}</h3>
              <span className="chapter-count">
                {userProgress[book.name] ? userProgress[book.name].length : 0}/{book.chapters}
              </span>
              <span className="expand-icon">
                {expandedBooks[book.name] ? '▼' : '▶'}
              </span>
            </div>
            
            {expandedBooks[book.name] && (
              <div className="chapters-grid">
                {Array.from({ length: book.chapters }, (_, i) => i + 1).map(chapterNum => (
                  <div key={chapterNum} className="chapter-item">
                    <label className="chapter-checkbox">
                      <input
                        type="checkbox"
                        checked={isChapterCompleted(book.name, chapterNum)}
                        onChange={(e) => handleChapterChange(book.name, chapterNum, e.target.checked)}
                      />
                      <span className="chapter-number">{chapterNum}</span>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <button onClick={handleSave} className="save-button">Save Progress</button>
      <Leaderboard currentUser={user} />
      <RisingStars currentUser={user} />
    </div>
  );
};

export default Home;