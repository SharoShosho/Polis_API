import React, { useState, useEffect } from 'react';
import { auth, realtimeDb } from '../../Firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue, set, remove } from 'firebase/database';

function Events() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');  // För att hålla reda på vald stad/plats
  const [favoriteEventIds, setFavoriteEventIds] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

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
    // Filtrera händelser baserat på vald plats
    if (selectedLocation === '') {
      setFilteredEvents(events);  // Visa alla om ingen stad är vald
    } else {
      setFilteredEvents(
        events.filter(event => event.location.name.toLowerCase().includes(selectedLocation.toLowerCase()))
      );
    }
  }, [selectedLocation, events]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        setFavoriteEventIds({});
        return;
      }

      const eventsRef = ref(realtimeDb, `favorites/${user.uid}/events`);
      onValue(eventsRef, (snapshot) => {
        setFavoriteEventIds(snapshot.val() || {});
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

  return (
    <div id="events-list">
      <div>
        <label htmlFor="locationFilter">Välj stad/plats: </label>
        <select
          id="locationFilter"
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}  // Uppdatera vald plats
          style={{
            padding: '10px',
            borderRadius: '5px',
            fontSize: '16px',
            marginBottom: '20px',
          }}
        >
          <option value="">Alla</option>
          {/* Dynamiskt skapa alternativ från unika städer */}
          {[...new Set(events.map(event => event.location.name))].map((location, index) => (
            <option key={index} value={location}>
              {location}
            </option>
          ))}
        </select>
      </div>

      {/* Rendera de filtrerade händelserna */}
      {filteredEvents.map((event) => (
        <div key={event.id} className="event">
          <h4>{event.name}</h4>
          <p><strong>Plats:</strong> {event.location.name}</p>
          <p><strong>Tid:</strong> {new Date(event.datetime).toLocaleString()}</p>
          <p><strong>Typ:</strong> {event.type}</p>
          <p>{event.summary}</p>
          <a href={event.url} target="_blank" rel="noopener noreferrer">Läs mer</a>
          <div style={{ marginTop: '10px' }}>
            {favoriteEventIds[event.id] ? (
              <button onClick={() => handleRemoveEventFavorite(event.id)}>Ta bort favorit</button>
            ) : (
              <button onClick={() => handleAddEventFavorite(event)}>Lagg till favorit</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Events;
