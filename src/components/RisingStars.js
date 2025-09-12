import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';

const RisingStars = ({ currentUser }) => {
  const [risingStars, setRisingStars] = useState({});
  const [cohorts, setCohorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  // Load available cohorts
  useEffect(() => {
    const loadCohorts = async () => {
      try {
        const cohortsQuery = query(collection(db, 'cohorts'));
        const cohortsSnapshot = await getDocs(cohortsQuery);
        const cohortsData = [];
        cohortsSnapshot.forEach((doc) => {
          cohortsData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        setCohorts(cohortsData);
      } catch (error) {
        console.error('Error loading cohorts:', error);
      }
    };

    loadCohorts();
  }, []);

  // Calculate rising stars (top 3 users by total chapters read in each cohort)
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
        
        // For each cohort, find top 3 users by total chapters read
        const cohortIds = [...new Set(users.map(user => user.cohort_id).filter(Boolean))];
        
        const risingStarsData = {};
        
        for (const cohortId of cohortIds) {
          // Get users for this cohort
          const cohortUsers = users.filter(user => user.cohort_id === cohortId);
          
          // Sort by total chapters read and take top 3
          const topUsers = cohortUsers
            .sort((a, b) => (b.chapters_read_count || 0) - (a.chapters_read_count || 0))
            .slice(0, 3);
          
          risingStarsData[cohortId] = topUsers;
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

  // Get cohort name by ID
  const getCohortName = (cohortId) => {
    const cohort = cohorts.find(c => c.id === cohortId);
    return cohort ? cohort.name : '';
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
          Object.entries(risingStars).map(([cohortId, users]) => (
            <div key={cohortId} className="cohort-section">
              <h3>{getCohortName(cohortId)}</h3>
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