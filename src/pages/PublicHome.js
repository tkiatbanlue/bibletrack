import React from 'react';
import Leaderboard from '../components/Leaderboard';
import RisingStars from '../components/RisingStars';
import Login from '../components/auth/Login';
import { useTranslation } from 'react-i18next';
import './PublicHome.css';

const PublicHome = () => {
  const { t } = useTranslation();

  return (
    <div className="public-home-container">
      <div className="public-content">
        <div className="leaderboard-section">
          <h1>{t('app.title')}</h1>
          <p>{t('publicHome.description')}</p>
          <Leaderboard />
          <RisingStars />
        </div>
        <div className="login-section">
          <Login />
        </div>
      </div>
    </div>
  );
};

export default PublicHome;