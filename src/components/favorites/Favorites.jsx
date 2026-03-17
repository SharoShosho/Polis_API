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
    <div className="favorites-page">
      <div className="favorites-hero">
        <div>
          <h2>Dina favoriter</h2>
          <p className="favorites-intro">
            Här hittar du alla sparade stationer, händelser och områden samlade på ett ställe.
          </p>
        </div>
        <div className="favorites-hero-actions">
          <button type="button" onClick={handleEnablePush}>
            Aktivera push i denna webbläsare
          </button>
        </div>
      </div>

      {pushStatus ? <p className="favorites-status">{pushStatus}</p> : null}

      <div className="favorites-summary-grid">
        <div className="favorites-summary-card">
          <span>Stationer</span>
          <strong>{favoriteStations.length}</strong>
        </div>
        <div className="favorites-summary-card">
          <span>Händelser</span>
          <strong>{favoriteEvents.length}</strong>
        </div>
        <div className="favorites-summary-card">
          <span>Områden</span>
          <strong>{favoriteLocations.length}</strong>
        </div>
      </div>

      {isLoading ? (
        <p>Hämtar favoriter...</p>
      ) : (
        <div className="favorites-sections">
          <section className="favorites-panel">
            <div className="favorites-panel-header">
              <div>
                <h3>Favoritstationer</h3>
                <p>Snabb åtkomst till stationer du har sparat.</p>
              </div>
              <span className="favorites-badge">{favoriteStations.length}</span>
            </div>

            {favoriteStations.length === 0 ? (
              <p className="favorites-empty">Inga favoritstationer än.</p>
            ) : (
              <ul className="favorites-list">
                {favoriteStations.map((station) => (
                  <li key={station.id} className="favorite-item-card">
                    <div className="favorite-item-content">
                      <h4>{station.name}</h4>
                      {station.locationName ? (
                        <p>
                          <strong>Plats:</strong> {station.locationName}
                        </p>
                      ) : null}
                    </div>
                    <div className="favorite-item-actions">
                      <button type="button" onClick={() => handleRemoveStationFavorite(station.id)}>
                        Ta bort favorit
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="favorites-panel">
            <div className="favorites-panel-header">
              <div>
                <h3>Favorithändelser</h3>
                <p>Händelser du vill kunna återvända till snabbt.</p>
              </div>
              <span className="favorites-badge">{favoriteEvents.length}</span>
            </div>

            {favoriteEvents.length === 0 ? (
              <p className="favorites-empty">Inga favorithändelser än.</p>
            ) : (
              <ul className="favorites-list">
                {favoriteEvents.map((event) => (
                  <li key={event.id} className="favorite-item-card">
                    <div className="favorite-item-content">
                      <h4>{event.name}</h4>
                      {event.locationName ? (
                        <p>
                          <strong>Plats:</strong> {event.locationName}
                        </p>
                      ) : null}
                      {event.datetime ? (
                        <p>
                          <strong>Tid:</strong> {new Date(event.datetime).toLocaleString('sv-SE')}
                        </p>
                      ) : null}
                    </div>
                    <div className="favorite-item-actions">
                      <button type="button" onClick={() => handleRemoveEventFavorite(event.id)}>
                        Ta bort favorit
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="favorites-panel">
            <div className="favorites-panel-header">
              <div>
                <h3>Favoritområden</h3>
                <p>Områden du bevakar med e-post och pushnotiser.</p>
              </div>
              <span className="favorites-badge">{favoriteLocations.length}</span>
            </div>

            {favoriteLocations.length === 0 ? (
              <p className="favorites-empty">Inga favoritområden än.</p>
            ) : (
              <ul className="favorites-list">
                {favoriteLocations.map((location) => (
                  <li key={location.id} className="favorite-item-card favorite-location-card">
                    <div className="favorite-item-content">
                      <h4>{location.name}</h4>
                      <div className="favorite-channel-row">
                        <span className={`favorite-chip ${location.emailNotifications ? 'is-on' : 'is-off'}`}>
                          E-post {location.emailNotifications ? 'På' : 'Av'}
                        </span>
                        <span className={`favorite-chip ${location.pushNotifications ? 'is-on' : 'is-off'}`}>
                          Push {location.pushNotifications ? 'På' : 'Av'}
                        </span>
                      </div>
                    </div>

                    <div className="favorite-item-actions favorite-location-actions">
                      <button type="button" onClick={() => handleToggleLocationNotification(location, 'emailNotifications')}>
                        {location.emailNotifications ? 'Stäng av e-post' : 'Aktivera e-post'}
                      </button>
                      <button type="button" onClick={() => handleToggleLocationNotification(location, 'pushNotifications')}>
                        {location.pushNotifications ? 'Stäng av push' : 'Aktivera push'}
                      </button>
                      <button type="button" onClick={() => handleRemoveLocationFavorite(location.id)}>
                        Ta bort favorit
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default Favorites;
