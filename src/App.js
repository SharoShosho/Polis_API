import React, { useState, useEffect } from 'react';
import PoliceStations from './components/PoliceStations';
import Events from './components/Events';

function App() {
  return (
    <div>
      <header>
        <h1>Polisstationer och Aktuella Händelser</h1>
      </header>

      <section id="police-stations">
        <h2>Polisstationer</h2>
        <PoliceStations />
      </section>

      <section id="events">
        <h2>Aktuella Händelser</h2>
        <Events />
      </section>

      <footer>
        <p>&copy; 2026 Polis API Applikation</p>
      </footer>
    </div>
  );
}

export default App;
