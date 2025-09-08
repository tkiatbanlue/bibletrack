import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';

const Leaderboard = ({ currentUser }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Load leaderboard data
  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        console.log('Loading leaderboard data with filter:', filter);
        let q;
        
        if (filter === 'all') {
          // Get top 5 users by chapters read
          q = query(
            collection(db, 'users'),
            orderBy('chapters_read_count', 'desc'),
            limit(5)
          );
        } else {
          // Get top 5 users by chapters read for specific class year
          q = query(
            collection(db, 'users'),
            where('class_year', '==', parseInt(filter)),
            orderBy('chapters_read_count', 'desc'),
            limit(5)
          );
        }
        
        const querySnapshot = await getDocs(q);
        console.log('Found users for leaderboard:', querySnapshot.size);
        
        const leaderboardData = [];
        
        querySnapshot.forEach((doc) => {
          leaderboardData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        console.log('Leaderboard data:', leaderboardData);
        setLeaderboard(leaderboardData);
      } catch (error) {
        console.error('Error loading leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadLeaderboard();
  }, [filter]);

  if (loading) {
    return <div className="loading">Loading leaderboard...</div>;
  }

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h2>🏆 Leaderboard</h2>
        <div className="leaderboard-filter">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Classes</option>
            <option value="2023">Class of 2023</option>
            <option value="2024">Class of 2024</option>
            <option value="2025">Class of 2025</option>
            <option value="2026">Class of 2026</option>
            <option value="2027">Class of 2027</option>
          </select>
        </div>
      </div>
      
      <div className="leaderboard-list">
        {leaderboard.length > 0 ? (
          leaderboard.map((user, index) => (
            <div 
              key={user.id} 
              className={`leaderboard-item ${currentUser && user.id === currentUser.uid ? 'current-user' : ''}`}
            >
              <div className="leaderboard-rank">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
              </div>
              <div className="leaderboard-user">
                <div className="user-name">{user.display_name}</div>
                <div className="user-class">Class of {user.class_year}</div>
              </div>
              <div className="leaderboard-chapters">
                {user.chapters_read_count} chapters
              </div>
            </div>
          ))
        ) : (
          <div className="no-data">No leaderboard data available</div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;