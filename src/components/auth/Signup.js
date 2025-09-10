import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, getDocs, query, addDoc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [group, setGroup] = useState('');
  const [newGroup, setNewGroup] = useState('');
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate password
    if (password.length < 8) {
      setError(t('errors.passwordLength'));
      setLoading(false);
      return;
    }

    // Check if password contains at least one number and one symbol
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!hasNumber || !hasSymbol) {
      setError(t('errors.passwordRequirements'));
      setLoading(false);
      return;
    }

    // Validate group selection
    if (!group && !newGroup.trim()) {
      setError(t('auth.signup.selectGroup'));
      setLoading(false);
      return;
    }

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

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
        }
      }

      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        display_name: displayName,
        email: email,
        group: groupId,
        created_at: new Date(),
        streak_count: 0,
        last_active: null,
        chapters_read_count: 0
      });

      // Redirect to home page
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>{t('auth.signup.title')}</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="displayName">{t('auth.signup.displayName')}</label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">{t('auth.signup.email')}</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">{t('auth.signup.password')}</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <small>{t('auth.signup.passwordHint')}</small>
          </div>
          <div className="form-group">
            <label htmlFor="group">{t('auth.signup.group')}</label>
            <select
              id="group"
              value={group}
              onChange={(e) => {
                setGroup(e.target.value);
                setNewGroup(''); // Clear new group when selecting existing
              }}
            >
              <option value="">{t('auth.signup.selectGroup')}</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="newGroup">{t('auth.signup.createGroup')}</label>
            <input
              type="text"
              id="newGroup"
              value={newGroup}
              onChange={(e) => {
                setNewGroup(e.target.value);
                setGroup(''); // Clear group selection when typing new group
              }}
              placeholder={t('auth.signup.newGroupPlaceholder')}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? t('auth.signup.signingUp') : t('auth.signup.button')}
          </button>
        </form>
        <div className="auth-links">
          <p>{t('auth.signup.hasAccount')} <Link to="/login">{t('auth.signup.login')}</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;