import React, { useState, useEffect } from 'react';

function Events() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Hämtar den senaste händelsedata från API:et
    fetch('https://polisen.se/api/events')  // Ersätt med det riktiga API:et
      .then((response) => response.json())
      .then((data) => setEvents(data))
      .catch((error) => console.error('Error fetching events:', error));
  }, []);  // Körs en gång när komponenten laddas

  return (
    <div id="events-list">
      {events.map((event) => (
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
