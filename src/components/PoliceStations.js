import React, { useState, useEffect } from 'react';


// Importera JSON-data eller hämta från ett API
import eventData from '../police_Stations.json';  // Eller använd en fetch-förfrågan om du har ett API

function PoliceStations() {
  const [stations, setStations] = useState([]);

  useEffect(() => {
    // Om du använder en extern API, gör en fetch här istället för att importera från JSON
    // fetch('https://polisen.se/api/policestations')
    //   .then((response) => response.json())
    //   .then((data) => setStations(data));

    // För nu använder vi den importerade JSON-datan
    setStations(eventData);
  }, []);


  return (
    <div id="stations-list">
      {stations.map((station) => (
        <div key={station.id} className="station">
          <h3>{station.name}</h3>
          <p><strong>Adress:</strong> {station.location.name}</p>
          <p><strong>Tjänster:</strong> {station.services.map(s => s.name).join(', ')}</p>
          <p><a href={station.Url} target="_blank" rel="noopener noreferrer">Mer info</a></p>
        </div>
      ))}
    </div>
  );
}

export default PoliceStations;
