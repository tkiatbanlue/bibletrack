import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from '../pages/Home';
import Profile from '../pages/Profile';
import Login from '../components/auth/Login';
import Signup from '../components/auth/Signup';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import '../App.css';
import '../pages/Home.css';
import '../pages/Profile.css';
import '../components/Leaderboard.css';
import '../components/RisingStars.css';
import '../components/StreakTracker.css';

const Layout = () => {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

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
            <Link to="/">Bible Reading Checklist</Link>
          </div>
          <ul className="nav-links">
            {user ? (
              <>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/profile">Profile</Link></li>
                <li>
                  <button 
                    onClick={() => auth.signOut()}
                    className="btn-logout"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/signup">Sign Up</Link></li>
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