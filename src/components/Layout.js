import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from '../pages/Home';
import Profile from '../pages/Profile';
import Login from '../components/auth/Login';
import Signup from '../components/auth/Signup';
import LanguageToggle from './LanguageToggle';
import DarkModeToggle from './DarkModeToggle';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import '../App.css';
import '../themes.css';
import '../pages/Home.css';
import '../pages/Profile.css';
import '../components/Leaderboard.css';
import '../components/RisingStars.css';
import '../components/StreakTracker.css';

const Layout = () => {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const { t } = useTranslation();

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-brand">
            <Link to="/">{t('app.title')}</Link>
          </div>
          <ul className="nav-links">
            {user ? (
              <>
                <li><Link to="/">{t('navigation.home')}</Link></li>
                <li><Link to="/profile">{t('navigation.profile')}</Link></li>
                <li>
                  <button 
                    onClick={() => auth.signOut()}
                    className="btn-logout"
                  >
                    {t('navigation.logout')}
                  </button>
                </li>
                <li>
                  <DarkModeToggle />
                </li>
                <li>
                  <LanguageToggle />
                </li>
              </>
            ) : (
              <>
                <li><Link to="/login">{t('navigation.login')}</Link></li>
                <li><Link to="/signup">{t('navigation.signup')}</Link></li>
                <li>
                  <DarkModeToggle />
                </li>
                <li>
                  <LanguageToggle />
                </li>
              </>
            )}
          </ul>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={user ? <Home user={user} /> : <Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={user ? <Profile user={user} /> : <Login />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default Layout;