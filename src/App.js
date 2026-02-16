import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';  // Importera React Router
import PoliceStations from './components/PoliceStations';
import Events from './components/Events';

function App() {
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
        </nav>

        <section id="content">
          {/* Routing till komponenterna */}
          <Routes>
            <Route path="/police-stations" element={<PoliceStations />} />
            <Route path="/events" element={<Events />} />
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
