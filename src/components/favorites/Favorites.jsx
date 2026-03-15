import React, { useState, useEffect } from 'react';
import { auth, realtimeDb } from '../../Firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue, remove } from 'firebase/database';

function Favorites() {
  const [favoriteStations, setFavoriteStations] = useState([]);
  const [favoriteEvents, setFavoriteEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        setFavoriteStations([]);
        setFavoriteEvents([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const favoritesRef = ref(realtimeDb, `favorites/${user.uid}`);
      onValue(favoritesRef, (snapshot) => {
        const data = snapshot.val() || {};
        const stationsObj = data.stations || {};
        const eventsObj = data.events || {};

        setFavoriteStations(Object.values(stationsObj));
        setFavoriteEvents(Object.values(eventsObj));
        setIsLoading(false);
      });
    });

    return () => unsubscribeAuth();
  }, []);

  const handleRemoveStationFavorite = async (stationId) => {
    if (!currentUser) {
      return;
    }

    await remove(ref(realtimeDb, `favorites/${currentUser.uid}/stations/${stationId}`));
  };

  const handleRemoveEventFavorite = async (eventId) => {
    if (!currentUser) {
      return;
    }

    await remove(ref(realtimeDb, `favorites/${currentUser.uid}/events/${eventId}`));
  };

  if (!currentUser) {
    return <p>Logga in for att se dina favoriter.</p>;
  }

  return (
    <div>
      <h3>Dina favoriter</h3>
      {isLoading ? (
        <p>Hämtar favoriter...</p>
      ) : (
        <>
          <h4>Stationer</h4>
          {favoriteStations.length === 0 ? (
            <p>Inga favoritstationer an.</p>
          ) : (
            <ul>
              {favoriteStations.map((station) => (
                <li key={station.id}>
                  <h4>{station.name}</h4>
                  <button onClick={() => handleRemoveStationFavorite(station.id)}>Ta bort favorit</button>
                </li>
              ))}
            </ul>
          )}

          <h4>Handelser</h4>
          {favoriteEvents.length === 0 ? (
            <p>Inga favorithandelser an.</p>
          ) : (
            <ul>
              {favoriteEvents.map((event) => (
                <li key={event.id}>
                  <h4>{event.name}</h4>
                  {event.locationName ? <p><strong>Plats:</strong> {event.locationName}</p> : null}
                  <button onClick={() => handleRemoveEventFavorite(event.id)}>Ta bort favorit</button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export default Favorites;
