import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './Firebase';
import PoliceStations from './components/policeStations/PoliceStations';
import Events from './components/events/Events';
import EventDetail from './components/events/EventDetail';
import NotificationCenter from './components/notifications/NotificationCenter';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Favorites from './components/favorites/Favorites';
import Profile from './components/profile/Profile';
import Home from './components/home/Home';


function App() {
  const [user, setUser] = useState(null);
  const [authResolved, setAuthResolved] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthResolved(true);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div>
        <header>
          <h1>Polisstationer och Aktuella Händelser</h1>
        </header>

        {/* Navigeringsknappar */}
        <nav>
          <Link to="/police-stations">
            <button>Polisstationer</button>
          </Link>
          <Link to="/events">
            <button>Aktuella Händelser</button>
          </Link>
          {user ? (
            <>
              <Link to="/favorites">
                <button>Favoriter</button>
              </Link>
              <Link to="/notifications">
                <button>Notiscenter</button>
              </Link>
              <Link to="/profile">
                <button>Min profil</button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login">
                <button>Logga in</button>
              </Link>
              <Link to="/register">
                <button>Registrera</button>
              </Link>
            </>
          )}
        </nav>

        <section id="content">
          {!authResolved ? (
            <p>Kontrollerar inloggning...</p>
          ) : (
            <Routes>
              <Route path="/" element={<Home user={user} />} />
              <Route path="/police-stations" element={<PoliceStations />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:eventId" element={<EventDetail />} />
              <Route path="/notifications" element={user ? <NotificationCenter /> : <Navigate to="/login" replace />} />
              <Route path="/login" element={user ? <Navigate to="/profile" replace /> : <Login />} />
              <Route path="/register" element={user ? <Navigate to="/profile" replace /> : <Register />} />
              <Route path="/favorites" element={user ? <Favorites /> : <Navigate to="/login" replace />} />
              <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          )}
        </section>

        <footer>
          <p>&copy; 2026 Polis API Applikation</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
