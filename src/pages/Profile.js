import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc, collection, getDocs, query, addDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { useTranslation } from 'react-i18next';

const Profile = ({ user }) => {
  const [displayName, setDisplayName] = useState('');
  const [group, setGroup] = useState('');
  const [newGroup, setNewGroup] = useState('');
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
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
      } catch (err) {
        console.error('Error loading groups:', err);
      }
    };

    loadGroups();
  }, []);

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setDisplayName(userData.display_name || '');
          setGroup(userData.group || '');
        } else {
          // If user document doesn't exist, create it
          setDisplayName(user.displayName || '');
        }
      } catch (err) {
        setError(t('errors.loadingProfile'));
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
      let groupId = group;
      
      // If user wants to create a new group
      if (newGroup.trim() !== '') {
        // Check if group already exists
        const existingGroup = groups.find(g => g.name.toLowerCase() === newGroup.trim().toLowerCase());
        if (existingGroup) {
          groupId = existingGroup.id;
        } else {
          // Create new group
          const newGroupDoc = await addDoc(collection(db, 'groups'), {
            name: newGroup.trim(),
            created_at: new Date()
          });
          groupId = newGroupDoc.id;
          // Add to local groups list
          setGroups(prev => [...prev, { id: groupId, name: newGroup.trim() }]);
        }
      }
      
      // Update Firebase Authentication display name
      await updateProfile(user, { displayName });
      
      // Update user document in Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        display_name: displayName,
        group: groupId
      });
      
      setSuccess(t('profile.successMessage'));
    } catch (err) {
      setError(t('errors.updatingProfile') + err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="loading">{t('profile.loading')}</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>{t('profile.title')}</h1>
      </div>
      
      <div className="profile-content">
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="email">{t('profile.email')}</label>
            <input
              type="email"
              id="email"
              value={user.email}
              disabled
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="displayName">{t('profile.displayName')}</label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="group">{t('profile.group')}</label>
            <select
              id="group"
              value={group}
              onChange={(e) => {
                setGroup(e.target.value);
                setNewGroup(''); // Clear new group when selecting existing
              }}
            >
              <option value="">{t('profile.selectGroup')}</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="newGroup">{t('profile.createGroup')}</label>
            <input
              type="text"
              id="newGroup"
              value={newGroup}
              onChange={(e) => {
                setNewGroup(e.target.value);
                setGroup(''); // Clear group selection when typing new group
              }}
              placeholder={t('profile.newGroupPlaceholder')}
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <button 
            type="submit" 
            disabled={updating} 
            className="btn-primary"
          >
            {updating ? t('profile.updating') : t('profile.updateButton')}
          </button>
        </form>
        
        <div className="profile-actions">
          <button 
            onClick={() => navigate('/')}
            className="btn-secondary"
          >
            {t('profile.backToChecklist')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;