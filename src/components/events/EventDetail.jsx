import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';

const formatDate = (value) => {
  if (!value) {
    return 'Okand tid';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Okand tid';
  }

  return date.toLocaleString('sv-SE');
};

function EventDetail() {
  const { eventId } = useParams();
  const location = useLocation();
  const [event, setEvent] = useState(location.state?.event || null);
  const [isLoading, setIsLoading] = useState(!location.state?.event);
  const [error, setError] = useState('');

  useEffect(() => {
    if (location.state?.event) {
      return;
    }

    const loadEvent = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await fetch('https://polisen.se/api/events');

        if (!response.ok) {
          throw new Error('Kunde inte hamta handelser.');
        }

        const data = await response.json();
        const foundEvent = data.find((item) => String(item.id) === eventId);

        if (!foundEvent) {
          setError('Handelsen kunde inte hittas.');
          return;
        }

        setEvent(foundEvent);
      } catch (loadError) {
        setError('Nagot gick fel nar handelsen skulle hamtas.');
      } finally {
        setIsLoading(false);
      }
    };

    loadEvent();
  }, [eventId, location.state]);

  return (
    <div className="event-detail-card">
      <h2>Handelsedetaljer</h2>

      {isLoading ? <p>Hamtar handelse...</p> : null}
      {!isLoading && error ? <p className="auth-error">{error}</p> : null}

      {!isLoading && !error && event ? (
        <div className="event-detail-content">
          <div className="event-detail-row">
            <span>Namn</span>
            <strong>{event.name || 'Namn saknas'}</strong>
          </div>
          <div className="event-detail-row">
            <span>Plats</span>
            <strong>{event.location?.name || 'Okand plats'}</strong>
          </div>
          <div className="event-detail-row">
            <span>Tid</span>
            <strong>{formatDate(event.datetime)}</strong>
          </div>
          <div className="event-detail-row">
            <span>Typ</span>
            <strong>{event.type || 'Typ saknas'}</strong>
          </div>

          <div className="event-detail-summary">
            <h3>Beskrivning</h3>
            <p>{event.summary || 'Ingen beskrivning tillganglig.'}</p>
          </div>

          <div className="event-detail-actions">
            <Link to="/events">
              <button type="button">Tillbaka till handelser</button>
            </Link>
            {event.url ? (
              <a href={event.url} target="_blank" rel="noopener noreferrer">
                <button type="button">Las original hos Polisen</button>
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default EventDetail;