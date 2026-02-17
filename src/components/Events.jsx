import React, { useState, useEffect } from 'react';

// Importera JSON-data eller hämta från ett API
import eventData from '../events.json';  // Eller använd en fetch-förfrågan om du har ett API

function Events() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Om du använder en extern API, gör en fetch här istället för att importera från JSON
    // fetch('https://polisen.se/api/events')
    //   .then((response) => response.json())
    //   .then((data) => setEvents(data));

    // För nu använder vi den importerade JSON-datan
    setEvents(eventData);
  }, []);

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
