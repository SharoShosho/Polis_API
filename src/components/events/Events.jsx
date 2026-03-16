import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth, realtimeDb } from '../../Firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue, set, remove } from 'firebase/database';

const getEventTimestamp = (event) => {
  const timestamp = new Date(event.datetime).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const withinTimeRange = (event, timeRange) => {
  if (timeRange === 'all') {
    return true;
  }

  const eventTimestamp = getEventTimestamp(event);
  if (!eventTimestamp) {
    return false;
  }

  const now = Date.now();
  const windowByRange = {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000
  };

  const windowMs = windowByRange[timeRange];
  if (!windowMs) {
    return true;
  }

  return eventTimestamp >= now - windowMs;
};

function Events() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [favoriteEventIds, setFavoriteEventIds] = useState({});
  const [favoriteLocationIds, setFavoriteLocationIds] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  const uniqueLocations = [...new Set(events.map((event) => event.location?.name).filter(Boolean))];
  const uniqueTypes = [...new Set(events.map((event) => event.type).filter(Boolean))];

  const getLocationKey = (locationName) =>
    locationName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

  useEffect(() => {
    // Hämtar den senaste händelsedata från API:et
    fetch('https://polisen.se/api/events')  // Ersätt med det riktiga API:et
      .then((response) => response.json())
      .then((data) => {
        setEvents(data);
        setFilteredEvents(data);  // Visa alla händelser när sidan laddas
      })
      .catch((error) => console.error('Error fetching events:', error));
  }, []);  // Körs en gång när komponenten laddas

  useEffect(() => {
    const nextFilteredEvents = events
      .filter((event) => {
        const locationName = event.location?.name || '';

        const locationMatch =
          selectedLocation === '' || locationName.toLowerCase().includes(selectedLocation.toLowerCase());
        const typeMatch = selectedType === '' || event.type === selectedType;
        const timeMatch = withinTimeRange(event, selectedTimeRange);

        return locationMatch && typeMatch && timeMatch;
      })
      .sort((a, b) => {
        const aTime = getEventTimestamp(a);
        const bTime = getEventTimestamp(b);

        return sortOrder === 'oldest' ? aTime - bTime : bTime - aTime;
      });

    setFilteredEvents(nextFilteredEvents);
  }, [events, selectedLocation, selectedType, selectedTimeRange, sortOrder]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        setFavoriteEventIds({});
        return;
      }

      const eventsRef = ref(realtimeDb, `favorites/${user.uid}/events`);
      const locationsRef = ref(realtimeDb, `favorites/${user.uid}/locations`);
      onValue(eventsRef, (snapshot) => {
        setFavoriteEventIds(snapshot.val() || {});
      });
      onValue(locationsRef, (snapshot) => {
        setFavoriteLocationIds(snapshot.val() || {});
      });
    });

    return () => unsubscribe();
  }, []);

  const handleAddEventFavorite = async (event) => {
    if (!currentUser) {
      alert('Logga in for att lagga till favoriter.');
      return;
    }

    const eventRef = ref(realtimeDb, `favorites/${currentUser.uid}/events/${event.id}`);
    await set(eventRef, {
      id: event.id,
      name: event.name,
      locationName: event.location?.name || '',
      datetime: event.datetime || '',
      type: event.type || '',
      url: event.url || ''
    });
  };

  const handleRemoveEventFavorite = async (eventId) => {
    if (!currentUser) {
      return;
    }

    const eventRef = ref(realtimeDb, `favorites/${currentUser.uid}/events/${eventId}`);
    await remove(eventRef);
  };

  const handleAddLocationFavorite = async (locationName) => {
    if (!currentUser) {
      alert('Logga in for att prenumerera pa omraden.');
      return;
    }

    const locationKey = getLocationKey(locationName);
    const locationRef = ref(realtimeDb, `favorites/${currentUser.uid}/locations/${locationKey}`);
    await set(locationRef, {
      id: locationKey,
      name: locationName,
      emailNotifications: true,
      pushNotifications: true,
      createdAt: new Date().toISOString()
    });
  };

  const handleRemoveLocationFavorite = async (locationName) => {
    if (!currentUser) {
      return;
    }

    const locationKey = getLocationKey(locationName);
    const locationRef = ref(realtimeDb, `favorites/${currentUser.uid}/locations/${locationKey}`);
    await remove(locationRef);
  };

  return (
    <div id="events-list">
      <div className="location-subscriptions">
        <h4>Prenumerera pa områden/städer</h4>
        <p>Valj vilka områden du vill få notiser för (e-post/push inställningar sparas per område).</p>
        <div className="location-grid">
          {uniqueLocations.map((location) => {
            const locationKey = getLocationKey(location);
            const isFavoriteLocation = Boolean(favoriteLocationIds[locationKey]);

            return (
              <div key={locationKey} className="location-item">
                <span>{location}</span>
                {isFavoriteLocation ? (
                  <button onClick={() => handleRemoveLocationFavorite(location)}>Ta bort favorit</button>
                ) : (
                  <button onClick={() => handleAddLocationFavorite(location)}>Favorit område</button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="events-filters">
        <div className="events-filter-item">
          <label htmlFor="locationFilter">Stad/plats</label>
          <select
            id="locationFilter"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            <option value="">Alla</option>
            {uniqueLocations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        <div className="events-filter-item">
          <label htmlFor="typeFilter">Typ av händelse</label>
          <select
            id="typeFilter"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="">Alla typer</option>
            {uniqueTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="events-filter-item">
          <label htmlFor="timeFilter">Tidsspann</label>
          <select
            id="timeFilter"
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
          >
            <option value="all">Alla tider</option>
            <option value="24h">Senaste 24 timmarna</option>
            <option value="7d">Senaste 7 dagarna</option>
            <option value="30d">Senaste 30 dagarna</option>
          </select>
        </div>

        <div className="events-filter-item">
          <label htmlFor="sortFilter">Sortering</label>
          <select
            id="sortFilter"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="newest">Nyast först</option>
            <option value="oldest">Äldst först</option>
          </select>
        </div>
      </div>

      <p className="events-count">Visar {filteredEvents.length} händelser</p>

      {/* Rendera de filtrerade händelserna */}
      {filteredEvents.length === 0 ? (
        <p>Inga händelser matchar dina filter.</p>
      ) : (
        filteredEvents.map((event) => (
          <div key={event.id} className="event">
            <h4>{event.name}</h4>
            <p><strong>Plats:</strong> {event.location?.name || 'Okänd plats'}</p>
            <p><strong>Tid:</strong> {new Date(event.datetime).toLocaleString()}</p>
            <p><strong>Typ:</strong> {event.type}</p>
            <p>{event.summary}</p>
            <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Link to={`/events/${event.id}`} state={{ event }}>
                <button type="button">Visa detaljer</button>
              </Link>
              {favoriteEventIds[event.id] ? (
                <button onClick={() => handleRemoveEventFavorite(event.id)}>Ta bort favorit</button>
              ) : (
                <button onClick={() => handleAddEventFavorite(event)}>Lägg till favorit</button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Events;
