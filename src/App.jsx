import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { auth,} from './Firebase';  // Importera Firebase Authentication
import PoliceStations from './components/policeStations/PoliceStations';
import Events from './components/events/Events';
import Login from './components/auth/Login';  // Se till att sökvägen är korrekt
import Favorites from './components/favorites/Favorites'; // Importera Favorites-komponenten


function App() {
  const [user, setUser] = useState(null);

  // Lyssna på om användaren loggar in eller ut
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
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
            <Link to="/favorites">
              <button>Favoriter</button>
            </Link>
          ) : (
            <Link to="/login">
              <button>Logga in</button>
            </Link>
          )}
        </nav>

        <section id="content">
          {/* Routing till komponenterna */}
          <Routes>
            <Route path="/police-stations" element={<PoliceStations />} />
            <Route path="/events" element={<Events />} />
            <Route path="/login" element={<Login />} />
            <Route path="/favorites" element={user ? <Favorites /> : <Login />} />
          </Routes>
        </section>

        <footer>
          <p>&copy; 2026 Polis API Applikation</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
