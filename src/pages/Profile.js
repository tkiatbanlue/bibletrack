import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';

const Profile = ({ user }) => {
  const [displayName, setDisplayName] = useState('');
  const [classYear, setClassYear] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setDisplayName(userData.display_name || '');
          setClassYear(userData.class_year || new Date().getFullYear());
        } else {
          // If user document doesn't exist, create it
          setDisplayName(user.displayName || '');
          setClassYear(new Date().getFullYear());
        }
      } catch (err) {
        setError('Error loading profile data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    setSuccess('');
    
    try {
      // Update Firebase Authentication display name
      await updateProfile(user, { displayName });
      
      // Update user document in Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        display_name: displayName,
        class_year: parseInt(classYear)
      });
      
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError('Error updating profile: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Profile</h1>
      </div>
      
      <div className="profile-content">
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={user.email}
              disabled
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="displayName">Display Name</label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="classYear">Class Year</label>
            <select
              id="classYear"
              value={classYear}
              onChange={(e) => setClassYear(e.target.value)}
            >
              {[2023, 2024, 2025, 2026, 2027].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <button 
            type="submit" 
            disabled={updating} 
            className="btn-primary"
          >
            {updating ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
        
        <div className="profile-actions">
          <button 
            onClick={() => navigate('/')}
            className="btn-secondary"
          >
            Back to Checklist
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;