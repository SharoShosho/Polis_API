import React, { useState, useEffect } from 'react';

function Events() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');  // För att hålla reda på vald stad/plats

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
        </div>
      ))}
    </div>
  );
}

export default Events;
