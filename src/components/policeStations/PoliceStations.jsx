import React, { useState, useEffect } from 'react';
import Map from '../map/Map';  // Importera kartkomponenten
import Search from '../search/Search';  // Importera Search-komponenten
import { auth, realtimeDb } from '../../Firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue, set, remove } from 'firebase/database';

// Importera JSON-data för polisstationer
import stationData from '../../police_Stations.json';  // Se till att denna fil innehåller korrekt data

function PoliceStations() {
  const [stations, setStations] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // Sökord
  const [filteredStations, setFilteredStations] = useState([]);
  const [favoriteStationIds, setFavoriteStationIds] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        setFavoriteStationIds({});
        return;
      }

      const stationsRef = ref(realtimeDb, `favorites/${user.uid}/stations`);
      onValue(stationsRef, (snapshot) => {
        setFavoriteStationIds(snapshot.val() || {});
      });
    });

    return () => unsubscribe();
  }, []);

  const handleAddFavorite = async (station) => {
    if (!currentUser) {
      alert('Logga in for att lagga till favoriter.');
      return;
    }

    const stationRef = ref(realtimeDb, `favorites/${currentUser.uid}/stations/${station.id}`);
    await set(stationRef, {
      id: station.id,
      name: station.name,
      locationName: station.location?.name || '',
      url: station.Url || ''
    });
  };

  const handleRemoveFavorite = async (stationId) => {
    if (!currentUser) {
      return;
    }

    const stationRef = ref(realtimeDb, `favorites/${currentUser.uid}/stations/${stationId}`);
    await remove(stationRef);
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

            {favoriteStationIds[station.id] ? (
              <button onClick={() => handleRemoveFavorite(station.id)}>Ta bort favorit</button>
            ) : (
              <button onClick={() => handleAddFavorite(station)}>Lagg till favorit</button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default PoliceStations;
