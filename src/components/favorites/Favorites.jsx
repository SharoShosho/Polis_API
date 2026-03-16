import React, { useState, useEffect } from 'react';
import { auth, realtimeDb } from '../../Firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue, remove, set } from 'firebase/database';
import { registerPushTokenForCurrentUser } from '../../notifications/pushNotifications';

function Favorites() {
  const [favoriteStations, setFavoriteStations] = useState([]);
  const [favoriteEvents, setFavoriteEvents] = useState([]);
  const [favoriteLocations, setFavoriteLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [pushStatus, setPushStatus] = useState('');

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
        const locationsObj = data.locations || {};

        setFavoriteStations(Object.values(stationsObj));
        setFavoriteEvents(Object.values(eventsObj));
        setFavoriteLocations(Object.values(locationsObj));
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

  const handleRemoveLocationFavorite = async (locationId) => {
    if (!currentUser) {
      return;
    }

    await remove(ref(realtimeDb, `favorites/${currentUser.uid}/locations/${locationId}`));
  };

  const handleToggleLocationNotification = async (location, field) => {
    if (!currentUser) {
      return;
    }

    await set(ref(realtimeDb, `favorites/${currentUser.uid}/locations/${location.id}`), {
      ...location,
      [field]: !location[field]
    });
  };

  const handleEnablePush = async () => {
    setPushStatus('Aktiverar push...');
    try {
      const vapidKey = process.env.REACT_APP_FIREBASE_VAPID_KEY;
      await registerPushTokenForCurrentUser(vapidKey);
      setPushStatus('Push har aktiverat for detta konto.');
    } catch (error) {
      setPushStatus(error.message || 'Kunde inte aktivera push.');
    }
  };

  if (!currentUser) {
    return <p>Logga in for att se dina favoriter.</p>;
  }

  return (
    <div>
      <h3>Dina favoriter</h3>
      <p>
        <button onClick={handleEnablePush}>Aktivera push i denna webbläsare</button>
      </p>
      {pushStatus ? <p>{pushStatus}</p> : null}
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

          <h4>Händelser</h4>
          {favoriteEvents.length === 0 ? (
            <p>Inga favorithändelser an.</p>
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

          <h4>Favoritområden</h4>
          {favoriteLocations.length === 0 ? (
            <p>Inga favoritområden an.</p>
          ) : (
            <ul>
              {favoriteLocations.map((location) => (
                <li key={location.id}>
                  <h4>{location.name}</h4>
                  <p>
                    <strong>E-post:</strong> {location.emailNotifications ? 'På' : 'Av'}{' '}
                    <strong>Push:</strong> {location.pushNotifications ? 'På' : 'Av'}
                  </p>
                  <p>
                    <button onClick={() => handleToggleLocationNotification(location, 'emailNotifications')}>
                      {location.emailNotifications ? 'Stang av e-post' : 'Aktivera e-post'}
                    </button>{' '}
                    <button onClick={() => handleToggleLocationNotification(location, 'pushNotifications')}>
                      {location.pushNotifications ? 'Stang av push' : 'Aktivera push'}
                    </button>
                  </p>
                  <button onClick={() => handleRemoveLocationFavorite(location.id)}>Ta bort favorit</button>
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
