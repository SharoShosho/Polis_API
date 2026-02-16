import React, { useState, useEffect } from 'react';

function PoliceStations() {
  const [stations, setStations] = useState([]);

  useEffect(() => {
    async function fetchStations() {
      const response = await fetch('https://polisen.se/api/policestations');
      const data = await response.json();
      setStations(data);
    }
    fetchStations();
  }, []);

  return (
    <div id="stations-list">
      {stations.map((station) => (
        <div key={station.id} className="station">
          <h3>{station.name}</h3>
          <p><strong>Adress:</strong> {station.location}</p>
          <p><strong>Tjänster:</strong> {station.services.join(', ')}</p>
          <p><a href={station.Url} target="_blank" rel="noopener noreferrer">Mer info</a></p>
        </div>
      ))}
    </div>
  );
}

export default PoliceStations;
