// Debug version of Leaderboard component with enhanced logging
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';

const LeaderboardDebug = ({ currentUser }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [filter, setFilter] = useState('all');
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState({});
  const { t } = useTranslation();

  // Load available groups
  useEffect(() => {
    const loadGroups = async () => {
      try {
        console.log('=== DEBUG: Loading groups ===');
        const groupsQuery = query(collection(db, 'groups'));
        const groupsSnapshot = await getDocs(groupsQuery);
        const groupsData = [];
        groupsSnapshot.forEach((doc) => {
          groupsData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        console.log('Loaded groups count:', groupsData.length);
        console.log('Groups data:', groupsData);
        setGroups(groupsData);
        setDebugInfo(prev => ({...prev, groupsCount: groupsData.length, groupsData}));
      } catch (error) {
        console.error('Error loading groups:', error);
        setDebugInfo(prev => ({...prev, groupsError: error.message}));
      }
    };

    loadGroups();
  }, []);

  // Load leaderboard data
  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true);
      try {
        console.log('=== DEBUG: Loading leaderboard data ===');
        console.log('Filter value:', filter);
        
        let q;
        
        if (filter === 'all' || filter === '') {
          // Get top 10 users by chapters read (all groups)
          console.log('Querying all users ordered by chapters_read_count');
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
        
        console.log('Executing query...');
        const querySnapshot = await getDocs(q);
        console.log('Query results count:', querySnapshot.size);
        
        const leaderboardData = [];
        
        querySnapshot.forEach((doc) => {
          const userData = {
            id: doc.id,
            ...doc.data()
          };
          console.log('User data:', userData);
          leaderboardData.push(userData);
        });
        
        console.log('Final leaderboard data:', leaderboardData);
        setLeaderboard(leaderboardData);
        setDebugInfo(prev => ({
          ...prev, 
          leaderboardCount: leaderboardData.length, 
          leaderboardData,
          filter: filter,
          queryType: filter === 'all' ? 'all users' : 'filtered by group'
        }));
      } catch (error) {
        console.error('Error loading leaderboard:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        setDebugInfo(prev => ({...prev, leaderboardError: error.message, errorCode: error.code}));
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
      
      {/* Debug Information */}
      <div className="debug-info" style={{background: 'var(--bg-tertiary)', padding: '10px', margin: '10px 0', borderRadius: '5px'}}>
        <h3>Debug Information</h3>
        <p><strong>Groups Loaded:</strong> {debugInfo.groupsCount || 0}</p>
        <p><strong>Leaderboard Items:</strong> {debugInfo.leaderboardCount || 0}</p>
        <p><strong>Current Filter:</strong> {debugInfo.filter || 'not set'}</p>
        <p><strong>Query Type:</strong> {debugInfo.queryType || 'not set'}</p>
        {debugInfo.groupsError && <p><strong>Groups Error:</strong> {debugInfo.groupsError}</p>}
        {debugInfo.leaderboardError && (
          <div>
            <p><strong>Leaderboard Error:</strong> {debugInfo.leaderboardError}</p>
            {debugInfo.errorCode && <p><strong>Error Code:</strong> {debugInfo.errorCode}</p>}
          </div>
        )}
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
                  <div className="user-email">{user.email || ''}</div>
                  {filter !== 'all' && (
                    <div className="user-group">{getGroupName(user.group)}</div>
                  )}
                  <div className="user-group-id">Group ID: {user.group || 'None'}</div>
                  <div className="user-chapters-read">Chapters: {user.chapters_read_count || 0}</div>
                </div>
                <div className="leaderboard-chapters">
                  {user.chapters_read_count || 0} {t('leaderboard.chapters')}
                </div>
              </div>
            ))
          ) : (
            <div className="no-data">
              {t('leaderboard.noData')}
              <div style={{marginTop: '10px', fontSize: '0.9em', color: 'var(--text-secondary)'}}>
                <p>No users found with the current filter.</p>
                <p>This could be because:</p>
                <ul>
                  <li>No users have completed any chapters yet</li>
                  <li>All users have chapters_read_count of 0</li>
                  <li>There's a filtering issue with the group selection</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LeaderboardDebug;