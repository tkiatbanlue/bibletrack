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
        const progressQuery = query(
          collection(db, 'progress'),
          where('user_id', '==', user.uid)
        );
        
        const progressSnapshot = await getDocs(progressQuery);
        const progressData = {};
        
        progressSnapshot.forEach(doc => {
          const { book, chapter } = doc.data();
          if (!progressData[book]) {
            progressData[book] = new Set();
          }
          progressData[book].add(chapter);
        });
        
        // Convert Sets to Arrays for easier handling
        Object.keys(progressData).forEach(book => {
          progressData[book] = Array.from(progressData[book]);
        });
        
        setUserProgress(progressData);
      } catch (error) {
        console.error('Error loading progress:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProgress();
  }, [user]);

  // Update user's chapter count in Firestore
  const updateUserChapterCount = async (newCount) => {
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        chapters_read_count: newCount
      });
    } catch (error) {
      console.error('Error updating user chapter count:', error);
    }
  };

  // Handle chapter checkbox change
  const handleChapterChange = async (bookName, chapterNum, isChecked) => {
    try {
      if (isChecked) {
        // Add progress record
        const docRef = await addDoc(collection(db, 'progress'), {
          user_id: user.uid,
          book: bookName,
          chapter: chapterNum,
          completed_at: new Date()
        });
        
        // Update local state
        setUserProgress(prev => {
          const newProgress = { ...prev };
          if (!newProgress[bookName]) {
            newProgress[bookName] = [];
          }
          newProgress[bookName] = [...newProgress[bookName], chapterNum];
          return newProgress;
        });
        
        // Update user's chapter count
        const currentCount = Object.values(userProgress).reduce((total, chapters) => total + chapters.length, 0);
        updateUserChapterCount(currentCount + 1);
      } else {
        // Remove progress record
        const progressQuery = query(
          collection(db, 'progress'),
          where('user_id', '==', user.uid),
          where('book', '==', bookName),
          where('chapter', '==', chapterNum)
        );
        
        const progressSnapshot = await getDocs(progressQuery);
        progressSnapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });
        
        // Update local state
        setUserProgress(prev => {
          const newProgress = { ...prev };
          if (newProgress[bookName]) {
            newProgress[bookName] = newProgress[bookName].filter(ch => ch !== chapterNum);
          }
          return newProgress;
        });
        
        // Update user's chapter count
        const currentCount = Object.values(userProgress).reduce((total, chapters) => total + chapters.length, 0);
        updateUserChapterCount(currentCount - 1);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
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
      
      <Leaderboard currentUser={user} />
      <RisingStars currentUser={user} />
    </div>
  );
};

export default Home;