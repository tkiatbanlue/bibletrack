import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';

const RisingStars = ({ currentUser }) => {
  const [risingStars, setRisingStars] = useState({});
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
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
      }
    };

    loadGroups();
  }, []);

  // Calculate rising stars (top 3 users by total chapters read in each group)
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
        
        // For each group, find top 3 users by total chapters read
        const groupIds = [...new Set(users.map(user => user.group).filter(Boolean))];
        console.log('Groups found:', groupIds);
        
        const risingStarsData = {};
        
        for (const groupId of groupIds) {
          console.log('Processing group:', groupId);
          // Get users for this group
          const groupUsers = users.filter(user => user.group === groupId);
          console.log('Users in group', groupId, ':', groupUsers);
          
          // Sort by total chapters read and take top 3
          const topUsers = groupUsers
            .sort((a, b) => (b.chapters_read_count || 0) - (a.chapters_read_count || 0))
            .slice(0, 3);
          
          risingStarsData[groupId] = topUsers;
          console.log('Top users for group', groupId, ':', topUsers);
        }
        
        console.log('Final rising stars data:', risingStarsData);
        setRisingStars(risingStarsData);
      } catch (error) {
        console.error('Error loading rising stars:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadRisingStars();
  }, []);

  // Get group name by ID
  const getGroupName = (groupId) => {
    const group = groups.find(g => g.id === groupId);
    return group ? group.name : 'Unknown Group';
  };

  if (loading) {
    return <div className="loading">{t('risingStars.loading')}</div>;
  }

  return (
    <div className="rising-stars-container">
      <div className="rising-stars-header">
        <h2>{t('risingStars.title')}</h2>
        <p>{t('risingStars.subtitle')}</p>
      </div>
      
      <div className="rising-stars-content">
        {Object.keys(risingStars).length > 0 ? (
          Object.entries(risingStars).map(([groupId, users]) => (
            <div key={groupId} className="group-section">
              <h3>{getGroupName(groupId)}</h3>
              <div className="rising-stars-list">
                {users.map((user, index) => (
                  <div 
                    key={user.id} 
                    className={`rising-star-item ${currentUser && user.id === currentUser.uid ? 'current-user' : ''}`}
                  >
                    <div className="star-rank">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </div>
                    <div className="star-user">
                      <div className="user-name">{user.display_name}</div>
                    </div>
                    <div className="star-chapters">
                      {user.chapters_read_count || 0} {t('risingStars.chapters')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="no-data">{t('risingStars.noData')}</div>
        )}
      </div>
    </div>
  );
};

export default RisingStars;