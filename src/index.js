import React from 'react';
import ReactDOM from 'react-dom/client';  // Importera från react-dom/client
import './style/styles.css';
import App from './App';
import 'leaflet/dist/leaflet.css'; // Importera Leaflet CSS

// Skapa en root med React 18's nya metod
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
