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
      }
    };

    loadGroups();
  }, []);

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
        
        // For each group, find top 3 users by recent activity
        const groupIds = [...new Set(users.map(user => user.group).filter(Boolean))];
        console.log('Groups found:', groupIds);
        
        const risingStarsData = {};
        
        for (const groupId of groupIds) {
          console.log('Processing group:', groupId);
          // Get users for this group
          const groupUsers = users.filter(user => user.group === groupId);
          console.log('Users in group', groupId, ':', groupUsers);
          
          // For each user, calculate chapters read in past 7 days
          const userChapters = await Promise.all(
            groupUsers.map(async user => {
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
          
          risingStarsData[groupId] = topUsers;
          console.log('Top users for group', groupId, ':', topUsers);
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
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#{index + 1}`}
                    </div>
                    <div className="star-user">
                      <div className="user-name">{user.display_name}</div>
                    </div>
                    <div className="star-chapters">
                      {user.recentChapters} {t('risingStars.chapters')}
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