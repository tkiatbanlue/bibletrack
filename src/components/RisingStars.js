import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

const RisingStars = ({ currentUser }) => {
  const [risingStars, setRisingStars] = useState({});
  const [loading, setLoading] = useState(true);

  // Calculate rising stars (top 3 users by chapters read in past 7 days)
  useEffect(() => {
    const loadRisingStars = async () => {
      try {
        // Get all users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const users = [];
        
        usersSnapshot.forEach(doc => {
          users.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        // For each class year, find top 3 users by recent activity
        const classYears = [...new Set(users.map(user => user.class_year))];
        const risingStarsData = {};
        
        for (const year of classYears) {
          // Get users for this class year
          const yearUsers = users.filter(user => user.class_year === year);
          
          // For each user, calculate chapters read in past 7 days
          const userChapters = await Promise.all(
            yearUsers.map(async user => {
              // Calculate date 7 days ago
              const sevenDaysAgo = new Date();
              sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
              
              // Get progress from past 7 days
              const progressQuery = query(
                collection(db, 'progress'),
                where('user_id', '==', user.id),
                where('completed_at', '>=', sevenDaysAgo)
              );
              
              const progressSnapshot = await getDocs(progressQuery);
              return {
                ...user,
                recentChapters: progressSnapshot.size
              };
            })
          );
          
          // Sort by recent chapters and take top 3
          const topUsers = userChapters
            .sort((a, b) => b.recentChapters - a.recentChapters)
            .slice(0, 3);
          
          risingStarsData[year] = topUsers;
        }
        
        setRisingStars(risingStarsData);
      } catch (error) {
        console.error('Error loading rising stars:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadRisingStars();
  }, []);

  if (loading) {
    return <div className="loading">Loading rising stars...</div>;
  }

  return (
    <div className="rising-stars-container">
      <div className="rising-stars-header">
        <h2>🚀 Rising Stars</h2>
        <p>Top 3 most active readers in the past 7 days</p>
      </div>
      
      <div className="rising-stars-content">
        {Object.keys(risingStars).length > 0 ? (
          Object.entries(risingStars).map(([year, users]) => (
            <div key={year} className="class-year-section">
              <h3>Class of {year}</h3>
              <div className="rising-stars-list">
                {users.map((user, index) => (
                  <div 
                    key={user.id} 
                    className={`rising-star-item ${currentUser && user.id === currentUser.uid ? 'current-user' : ''}`}
                  >
                    <div className="star-rank">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#{index + 1}`}
                    </div>
                    <div className="star-user">
                      <div className="user-name">{user.display_name}</div>
                    </div>
                    <div className="star-chapters">
                      {user.recentChapters} chapters
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="no-data">No rising stars data available</div>
        )}
      </div>
    </div>
  );
};

export default RisingStars;