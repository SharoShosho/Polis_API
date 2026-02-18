import React, { useState, useEffect } from 'react';
import Map from '../map/Map';  // Importera kartkomponenten
import Search from '../search/Search';  // Importera Search-komponenten
import { auth, firestore } from '../../Firebase'; // Justera sökvägen beroende på din mappstruktur

// Importera JSON-data för polisstationer
import stationData from '../../police_Stations.json';  // Se till att denna fil innehåller korrekt data

function PoliceStations() {
  const [stations, setStations] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // Sökord
  const [filteredStations, setFilteredStations] = useState([]);
  const [favorites, setFavorites] = useState([]);  // State för favoriter

  useEffect(() => {
    setStations(stationData);  // Ladda polisstationerna
  }, []);

  useEffect(() => {
    // Filtrera stationer baserat på sökordet
    if (searchTerm === '') {
      setFilteredStations(stations);  // Visa alla stationer om inget sökord
    } else {
      setFilteredStations(
        stations.filter(station =>
          station.name.toLowerCase().includes(searchTerm.toLowerCase())  // Filtrera efter namn
        )
      );
    }
  }, [searchTerm, stations]);

  const handleAddFavorite = (station) => {
    const user = auth.currentUser;
    if (user) {
      const newFavorites = [...favorites, station];
      firestore.collection('favorites').doc(user.uid).set({
        stations: newFavorites,
      });
      setFavorites(newFavorites);  // Uppdatera state
    }
  };

  return (
    <div id="stations-list">
      <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {filteredStations.map((station) => {
        const [latitude, longitude] = station.location.gps.split(',').map(coord => parseFloat(coord.trim()));

        return (
          <div key={station.id} className="station">
            <h3>{station.name}</h3>
            <p><strong>Adress:</strong> {station.location.name}</p>

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

            <button onClick={() => handleAddFavorite(station)}>Lägg till favorit</button>
          </div>
        );
      })}
    </div>
  );
}

export default PoliceStations;
