import React, { useState, useEffect } from 'react';

// Importera JSON-data för polisstationer
import stationData from '../police_Stations.json';  // Se till att denna fil innehåller korrekt data

function PoliceStations() {
  const [stations, setStations] = useState([]);

  useEffect(() => {
    // Här används den importerade JSON-datan istället för fetch
    setStations(stationData);
  }, []);

  return (
    <div id="stations-list">
      {stations.map((station) => (
        <div key={station.id} className="station">
          <h3>{station.name}</h3>
          <p><strong>Adress:</strong> {station.location.name}</p>
          
          {/* Om services är en lista av strängar, rendera dem så här */}
          <p><strong>Tjänster:</strong> {station.services.map(service => service.name)}</p> 
          
          {/* Om services är en lista av objekt, använd map för att extrahera information */}
          {/* Exempel: <p><strong>Tjänster:</strong> {station.services.map(service => service.name).join(', ')}</p> */}
          
          <p><a href={station.Url} target="_blank" rel="noopener noreferrer">Mer info</a></p>
        </div>
      ))}
    </div>
  );
}

export default PoliceStations;
