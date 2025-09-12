import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, collection, getDocs, query } from 'firebase/firestore';
import { db } from '../firebase';
import { useTranslation } from 'react-i18next';

const GroupManager = ({ user, groupId }) => {
  const [groupData, setGroupData] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { t } = useTranslation();

  // Load group data
  useEffect(() => {
    const loadGroupData = async () => {
      if (!groupId) return;
      
      try {
        const groupDoc = await getDoc(doc(db, 'groups', groupId));
        if (groupDoc.exists()) {
          const data = groupDoc.data();
          setGroupData(data);
          setGroupName(data.name || '');
        }
      } catch (err) {
        setError(t('errors.loadingGroup'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadGroupData();
  }, [groupId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    setSuccess('');
    
    try {
      // Update group document in Firestore
      await updateDoc(doc(db, 'groups', groupId), {
        name: groupName,
        updated_by: user.uid,
        updated_at: new Date()
      });
      
      setSuccess(t('group.updatedSuccessfully'));
    } catch (err) {
      setError(t('errors.updatingGroup') + err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="loading">{t('group.loading')}</div>;
  }

  if (!groupData) {
    return <div className="error-message">{t('group.notFound')}</div>;
  }

  return (
    <div className="group-manager-container">
      <div className="group-manager-header">
        <h2>{t('group.manageGroup')}</h2>
      </div>
      
      <div className="group-manager-content">
        <form onSubmit={handleSubmit} className="group-form">
          <div className="form-group">
            <label htmlFor="groupName">{t('group.groupName')}</label>
            <input
              type="text"
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>{t('group.createdBy')}</label>
            <div>{groupData.created_by_name || groupData.created_by || t('group.unknownUser')}</div>
          </div>
          
          {groupData.created_at && (
            <div className="form-group">
              <label>{t('group.createdAt')}</label>
              <div>{new Date(groupData.created_at.toDate()).toLocaleDateString()}</div>
            </div>
          )}
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <button 
            type="submit" 
            disabled={updating} 
            className="btn-primary"
          >
            {updating ? t('group.updating') : t('group.updateButton')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GroupManager;