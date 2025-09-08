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
        console.log('Loading rising stars data...');
        // Get all users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        console.log('Found users:', usersSnapshot.size);
        
        const users = [];
        
        usersSnapshot.forEach(doc => {
          users.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        console.log('Processed users data:', users);
        
        // For each class year, find top 3 users by recent activity
        const classYears = [...new Set(users.map(user => user.class_year))];
        console.log('Class years found:', classYears);
        
        const risingStarsData = {};
        
        for (const year of classYears) {
          console.log('Processing class year:', year);
          // Get users for this class year
          const yearUsers = users.filter(user => user.class_year === year);
          console.log('Users in class year', year, ':', yearUsers);
          
          // For each user, calculate chapters read in past 7 days
          const userChapters = await Promise.all(
            yearUsers.map(async user => {
              try {
                // Calculate date 7 days ago
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                
                console.log('Calculating recent chapters for user:', user.id);
                
                // Get progress from past 7 days
                const progressQuery = query(
                  collection(db, 'progress'),
                  where('user_id', '==', user.id),
                  where('completed_at', '>=', sevenDaysAgo)
                );
                
                const progressSnapshot = await getDocs(progressQuery);
                console.log('Found recent progress documents for user', user.id, ':', progressSnapshot.size);
                
                return {
                  ...user,
                  recentChapters: progressSnapshot.size
                };
              } catch (userError) {
                console.error('Error calculating recent chapters for user', user.id, ':', userError);
                return {
                  ...user,
                  recentChapters: 0
                };
              }
            })
          );
          
          // Sort by recent chapters and take top 3
          const topUsers = userChapters
            .sort((a, b) => b.recentChapters - a.recentChapters)
            .slice(0, 3);
          
          risingStarsData[year] = topUsers;
          console.log('Top users for class year', year, ':', topUsers);
        }
        
        console.log('Final rising stars data:', risingStarsData);
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