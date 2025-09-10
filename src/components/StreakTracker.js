import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';

const StreakTracker = ({ user }) => {
  const [streakCount, setStreakCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  // Calculate streak count
  useEffect(() => {
    const calculateStreak = async () => {
      if (!user) return;
      
      try {
        console.log('Calculating streak for user:', user.uid);
        // Get all progress records for the user, ordered by date
        const progressQuery = query(
          collection(db, 'progress'),
          where('user_id', '==', user.uid),
          orderBy('completed_at', 'desc')
        );
        
        const progressSnapshot = await getDocs(progressQuery);
        console.log('Found progress documents for streak calculation:', progressSnapshot.size);
        
        const progressDates = [];
        
        progressSnapshot.forEach(doc => {
          const { completed_at } = doc.data();
          console.log('Processing progress document for streak:', { completed_at });
          // Convert Firestore timestamp to Date object
          const date = completed_at.toDate ? completed_at.toDate() : new Date(completed_at);
          // Get date without time (set to midnight)
          const dateWithoutTime = new Date(date.getFullYear(), date.getMonth(), date.getDate());
          progressDates.push(dateWithoutTime);
        });
        
        console.log('Processed dates for streak calculation:', progressDates);
        
        // Remove duplicate dates
        const uniqueDates = [...new Set(progressDates.map(date => date.getTime()))]
          .map(time => new Date(time));
        
        console.log('Unique dates for streak calculation:', uniqueDates);
        
        // Sort dates in descending order
        uniqueDates.sort((a, b) => b - a);
        
        // Calculate streak
        let streak = 0;
        let currentDate = new Date();
        
        // Set to midnight for comparison
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        
        // Check if user read today
        const readToday = uniqueDates.some(date => 
          date.getTime() === currentDate.getTime()
        );
        
        console.log('Read today:', readToday);
        
        // If user didn't read today, start from yesterday
        if (!readToday) {
          currentDate.setDate(currentDate.getDate() - 1);
        }
        
        // Count consecutive days
        for (let i = 0; i < uniqueDates.length; i++) {
          const date = uniqueDates[i];
          
          // Check if this date is the expected date in the streak
          if (date.getTime() === currentDate.getTime()) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
          } else {
            // Break the streak if we find a gap
            break;
          }
        }
        
        console.log('Calculated streak count:', streak);
        setStreakCount(streak);
      } catch (error) {
        console.error('Error calculating streak:', error);
      } finally {
        setLoading(false);
      }
    };
    
    calculateStreak();
  }, [user]);

  if (loading) {
    return <div className="streak-loading">{t('streak.loading')}</div>;
  }

  return (
    <div className="streak-tracker">
      <div className="streak-content">
        <div className="streak-icon">🔥</div>
        <div className="streak-info">
          <div className="streak-count">{streakCount}</div>
          <div className="streak-label">{t('streak.label')}</div>
        </div>
      </div>
    </div>
  );
};

export default StreakTracker;