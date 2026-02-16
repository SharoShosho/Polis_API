import React, { useState, useEffect } from 'react';

function Events() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    async function fetchEvents() {
      const response = await fetch('https://polisen.se/api/events');
      const data = await response.json();
      setEvents(data);
    }
    fetchEvents();
  }, []);

  return (
    <div id="events-list">
      {events.map((event, index) => (
        <div key={index} className="event">
          <h4>{event.title}</h4>
          <p><strong>Plats:</strong> {event.location}</p>
          <p><strong>Tid:</strong> {new Date(event.dateTime).toLocaleString()}</p>
          <p><strong>Typ:</strong> {event.type}</p>
        </div>
      ))}
    </div>
  );
}

export default Events;
