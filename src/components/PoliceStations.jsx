import React, { useState, useEffect } from 'react';
import Map from './Map';  // Importera Map-komponenten

// Importera JSON-data för polisstationer
import stationData from '../police_Stations.json';  // Se till att denna fil innehåller korrekt data

function PoliceStations() {
  const [stations, setStations] = useState([]);

  useEffect(() => {
    setStations(stationData);  // Ladda polisstationerna
  }, []);

  return (
    <div id="stations-list">
      {stations.map((station) => {
        const [latitude, longitude] = station.location.gps.split(',').map(coord => parseFloat(coord.trim()));

        return (
          <div key={station.id} className="station">
            <h3>{station.name}</h3>
            <p><strong>Adress:</strong> {station.location.name}</p>

            {/* Visa OpenStreetMap här */}
            <Map 
              latitude={latitude} 
              longitude={longitude} 
              locationName={station.name} 
            />

            {/* Rendera tjänster */}
            <p><strong>Tjänster:</strong> 
              {station.services && station.services.length > 0 ? (
                station.services.map((service, index) => (
                  <span key={index}>
                    {service.name}
                    {index < station.services.length - 1 && ', '}
                  </span>
                ))
              ) : (
                'Ingen tjänst tillgänglig'
              )}
            </p>

            <p><a href={station.Url} target="_blank" rel="noopener noreferrer">Mer info</a></p>
          </div>
        );
      })}
    </div>
  );
}

export default PoliceStations;
