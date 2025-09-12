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
        console.log('Loaded groups:', groupsData);
      } catch (error) {
        console.error('Error loading groups:', error);
      }
    };

    loadGroups();
  }, []);

  // Load leaderboard data
  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true);
      try {
        console.log('Loading leaderboard data with filter:', filter);
        let q;
        
        if (filter === 'all' || filter === '') {
          // Get top 10 users by chapters read (all groups)
          q = query(
            collection(db, 'users'),
            orderBy('chapters_read_count', 'desc'),
            limit(10)
          );
        } else {
          // Get top 10 users by chapters read for specific group
          console.log('Filtering by group ID:', filter);
          q = query(
            collection(db, 'users'),
            where('group', '==', filter),
            orderBy('chapters_read_count', 'desc'),
            limit(10)
          );
        }
        
        const querySnapshot = await getDocs(q);
        console.log('Found users for leaderboard:', querySnapshot.size);
        
        const leaderboardData = [];
        
        querySnapshot.forEach((doc) => {
          const userData = {
            id: doc.id,
            ...doc.data()
          };
          console.log('User data:', userData);
          leaderboardData.push(userData);
        });
        
        console.log('Leaderboard data:', leaderboardData);
        setLeaderboard(leaderboardData);
      } catch (error) {
        console.error('Error loading leaderboard:', error);
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadLeaderboard();
  }, [filter]);

  // Get group name by ID
  const getGroupName = (groupId) => {
    if (!groupId || groupId === 'all' || groupId === '') return '';
    const group = groups.find(g => g.id === groupId);
    return group ? group.name : '';
  };

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h2>{t('leaderboard.title')}</h2>
        <div className="leaderboard-filter">
          <select 
            value={filter} 
            onChange={(e) => {
              console.log('Group filter changed to:', e.target.value);
              setFilter(e.target.value);
            }}
          >
            <option value="all">{t('leaderboard.allGroups')}</option>
            {groups.map(group => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="loading">{t('leaderboard.loading')}</div>
      ) : (
        <div className="leaderboard-list">
          {leaderboard && leaderboard.length > 0 ? (
            leaderboard.map((user, index) => (
              <div 
                key={user.id || index} 
                className={`leaderboard-item ${currentUser && user.id === currentUser.uid ? 'current-user' : ''}`}
              >
                <div className="leaderboard-rank">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </div>
                <div className="leaderboard-user">
                  <div className="user-name">{user.display_name || 'Anonymous User'}</div>
                  {filter !== 'all' && (
                    <div className="user-group">{getGroupName(user.group)}</div>
                  )}
                </div>
                <div className="leaderboard-chapters">
                  {user.chapters_read_count || 0} {t('leaderboard.chapters')}
                </div>
              </div>
            ))
          ) : (
            <div className="no-data">{t('leaderboard.noData')}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;