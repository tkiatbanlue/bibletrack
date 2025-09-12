import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';

const Leaderboard = ({ currentUser }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [filter, setFilter] = useState('global');
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

  // Load leaderboard data
  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true);
      try {
        let q;
        
        if (filter === 'global') {
          // Get top 10 users by chapters read (all users)
          q = query(
            collection(db, 'users'),
            orderBy('chapters_read_count', 'desc'),
            limit(10)
          );
        } else {
          // Get top 10 users by chapters read for specific cohort
          q = query(
            collection(db, 'users'),
            where('cohort_id', '==', filter),
            orderBy('chapters_read_count', 'desc'),
            limit(10)
          );
        }
        
        const querySnapshot = await getDocs(q);
        const leaderboardData = [];
        
        querySnapshot.forEach((doc) => {
          const userData = {
            id: doc.id,
            ...doc.data()
          };
          leaderboardData.push(userData);
        });
        
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

  // Get cohort name by ID
  const getCohortName = (cohortId) => {
    if (!cohortId || cohortId === 'global') return '';
    const cohort = cohorts.find(c => c.id === cohortId);
    return cohort ? cohort.name : '';
  };

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h2>{t('leaderboard.title')}</h2>
        <div className="leaderboard-filter">
          <select 
            value={filter} 
            onChange={(e) => {
              setFilter(e.target.value);
            }}
          >
            <option value="global">{t('leaderboard.allCohorts')}</option>
            {cohorts.map(cohort => (
              <option key={cohort.id} value={cohort.id}>{cohort.name}</option>
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
                  {filter !== 'global' && (
                    <div className="user-cohort">{getCohortName(user.cohort_id)}</div>
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