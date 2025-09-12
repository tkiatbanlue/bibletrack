import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';

const CohortManager = ({ onCohortSelect, currentCohortId, mode = 'signup' }) => {
  const [cohorts, setCohorts] = useState([]);
  const [selectedCohort, setSelectedCohort] = useState(currentCohortId || '');
  const [newCohortName, setNewCohortName] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [view, setView] = useState('select'); // 'select' or 'create'
  const { t } = useTranslation();

  // Load available cohorts
  useEffect(() => {
    const loadCohorts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'cohorts'));
        const cohortsData = [];
        querySnapshot.forEach((doc) => {
          cohortsData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        setCohorts(cohortsData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading cohorts:', err);
        setError(t('errors.loadingCohorts'));
        setLoading(false);
      }
    };

    loadCohorts();
  }, [t]);

  // Handle cohort selection
  const handleCohortChange = (e) => {
    const cohortId = e.target.value;
    setSelectedCohort(cohortId);
    setConfirmCode('');
    setError('');
  };

  // Handle code confirmation
  const handleConfirmCode = () => {
    if (!selectedCohort) {
      setError(t('errors.selectCohort'));
      return;
    }

    const cohort = cohorts.find(c => c.id === selectedCohort);
    if (!cohort) {
      setError(t('errors.invalidCohort'));
      return;
    }

    if (cohort.code !== confirmCode) {
      setError(t('errors.incorrectCohortCode'));
      return;
    }

    // Code is correct, select this cohort
    onCohortSelect(selectedCohort);
    setSuccess(t('cohort.selectedSuccess'));
    setError('');
  };

  // Handle creating a new cohort
  const handleCreateCohort = async () => {
    if (!newCohortName.trim()) {
      setError(t('errors.enterCohortName'));
      return;
    }

    try {
      // Generate a random 4-digit alphanumeric code
      const code = Math.random().toString(36).substring(2, 6).toUpperCase();
      
      // Create the cohort
      const docRef = await addDoc(collection(db, 'cohorts'), {
        name: newCohortName,
        code: code,
        created_at: new Date(),
        is_active: true
      });

      // Add the new cohort to the list
      const newCohort = {
        id: docRef.id,
        name: newCohortName,
        code: code,
        created_at: new Date(),
        is_active: true
      };
      
      setCohorts([...cohorts, newCohort]);
      setSelectedCohort(docRef.id);
      onCohortSelect(docRef.id);
      setSuccess(t('cohort.createdSuccess'));
      setError('');
      setView('select'); // Switch back to selection view
      setNewCohortName('');
    } catch (err) {
      console.error('Error creating cohort:', err);
      setError(t('errors.creatingCohort'));
    }
  };

  // Get current cohort name for display
  const getCurrentCohortName = () => {
    if (!currentCohortId) return '';
    const cohort = cohorts.find(c => c.id === currentCohortId);
    return cohort ? cohort.name : '';
  };

  if (loading) {
    return <div className="cohort-manager">{t('cohort.loading')}</div>;
  }

  return (
    <div className="cohort-manager">
      {mode === 'profile' && (
        <div className="current-cohort">
          <h4>{t('cohort.current')}</h4>
          <p>{getCurrentCohortName() || t('cohort.none')}</p>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {view === 'select' ? (
        <div className="cohort-selection">
          <h3>{mode === 'profile' ? t('cohort.change') : t('cohort.select')}</h3>
          
          <div className="form-group">
            <label htmlFor="cohort-select">{t('cohort.selectLabel')}</label>
            <select 
              id="cohort-select"
              value={selectedCohort}
              onChange={handleCohortChange}
            >
              <option value="">{t('cohort.choose')}</option>
              {cohorts.map((cohort) => (
                <option key={cohort.id} value={cohort.id}>
                  {cohort.name}
                </option>
              ))}
            </select>
          </div>

          {selectedCohort && (
            <div className="form-group">
              <label htmlFor="cohort-code">{t('cohort.enterCode')}</label>
              <input
                type="text"
                id="cohort-code"
                value={confirmCode}
                onChange={(e) => setConfirmCode(e.target.value.toUpperCase())}
                placeholder={t('cohort.codePlaceholder')}
                maxLength="4"
              />
              <button 
                type="button" 
                onClick={handleConfirmCode}
                className="btn-primary"
              >
                {t('cohort.confirm')}
              </button>
            </div>
          )}

          <div className="cohort-actions">
            <button 
              type="button" 
              onClick={() => setView('create')}
              className="btn-secondary"
            >
              {t('cohort.create')}
            </button>
          </div>
        </div>
      ) : (
        <div className="cohort-creation">
          <h3>{t('cohort.createTitle')}</h3>
          
          <div className="form-group">
            <label htmlFor="new-cohort-name">{t('cohort.nameLabel')}</label>
            <input
              type="text"
              id="new-cohort-name"
              value={newCohortName}
              onChange={(e) => setNewCohortName(e.target.value)}
              placeholder={t('cohort.namePlaceholder')}
            />
          </div>

          <div className="cohort-actions">
            <button 
              type="button" 
              onClick={handleCreateCohort}
              className="btn-primary"
            >
              {t('cohort.createButton')}
            </button>
            <button 
              type="button" 
              onClick={() => setView('select')}
              className="btn-secondary"
            >
              {t('cohort.backToSelect')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CohortManager;