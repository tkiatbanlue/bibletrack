import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';

const Leaderboard = ({ currentUser }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [filter, setFilter] = useState('all');
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  // Load available groups
  useEffect(() => {
    const loadGroups = async () => {
      try {
        const groupsQuery = query(collection(db, 'groups'));
        const groupsSnapshot = await getDocs(groupsQuery);
        const groupsData = [];
        groupsSnapshot.forEach((doc) => {
          groupsData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        setGroups(groupsData);
      } catch (error) {
        console.error('Error loading groups:', error);
      }
    };

    loadGroups();
  }, []);

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
          // Get top 5 users by chapters read for specific group
          q = query(
            collection(db, 'users'),
            where('group', '==', filter),
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

  // Get group name by ID
  const getGroupName = (groupId) => {
    const group = groups.find(g => g.id === groupId);
    return group ? group.name : 'Unknown Group';
  };

  if (loading) {
    return <div className="loading">{t('leaderboard.loading')}</div>;
  }

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h2>{t('leaderboard.title')}</h2>
        <div className="leaderboard-filter">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">{t('leaderboard.allGroups')}</option>
            {groups.map(group => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
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
                <div className="user-group">{getGroupName(user.group)}</div>
              </div>
              <div className="leaderboard-chapters">
                {user.chapters_read_count} {t('leaderboard.chapters')}
              </div>
            </div>
          ))
        ) : (
          <div className="no-data">{t('leaderboard.noData')}</div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;