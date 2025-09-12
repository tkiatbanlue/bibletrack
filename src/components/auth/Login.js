import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState(''); // For success messages
  const [loading, setLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false); // Toggle for reset form
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (!email) {
      setError(t('auth.login.emailRequired'));
      setLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage(t('auth.login.passwordResetSent'));
      setShowResetForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>{t('auth.login.title')}</h2>
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}
        
        {!showResetForm ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">{t('auth.login.email')}</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">{t('auth.login.password')}</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? t('auth.login.loggingIn') : t('auth.login.button')}
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordReset}>
            <div className="form-group">
              <label htmlFor="resetEmail">{t('auth.login.email')}</label>
              <input
                type="email"
                id="resetEmail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <small>{t('auth.login.passwordResetHint')}</small>
            </div>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? t('auth.login.sendingReset') : t('auth.login.sendReset')}
            </button>
          </form>
        )}
        
        <div className="auth-links">
          <p>{t('auth.login.noAccount')} <Link to="/signup">{t('auth.login.signUp')}</Link></p>
          {!showResetForm ? (
            <p>
              <button 
                type="button" 
                onClick={() => setShowResetForm(true)}
                className="link-button"
              >
                {t('auth.login.forgotPassword')}
              </button>
            </p>
          ) : (
            <p>
              <button 
                type="button" 
                onClick={() => setShowResetForm(false)}
                className="link-button"
              >
                {t('auth.login.backToLogin')}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;