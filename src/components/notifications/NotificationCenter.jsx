import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { onValue, ref, remove, set } from 'firebase/database';
import { auth, realtimeDb } from '../../Firebase';

const toTimestamp = (value) => {
  if (!value) {
    return 0;
  }

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

function NotificationCenter() {
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

      if (!user) {
        setNotifications([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const notificationsRef = ref(realtimeDb, `notifications/${user.uid}`);

      onValue(notificationsRef, (snapshot) => {
        const data = snapshot.val() || {};
        const parsed = Object.entries(data)
          .map(([id, item]) => ({ id, ...item }))
          .sort((a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt));

        setNotifications(parsed);
        setIsLoading(false);
      });
    });

    return () => unsubscribeAuth();
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications]
  );

  const handleMarkAsRead = async (notification) => {
    if (!currentUser || notification.isRead) {
      return;
    }

    await set(ref(realtimeDb, `notifications/${currentUser.uid}/${notification.id}/isRead`), true);
  };

  const handleClearAll = async () => {
    if (!currentUser) {
      return;
    }

    const confirmed = window.confirm('Vill du ta bort alla notiser i notiscentret?');
    if (!confirmed) {
      return;
    }

    await remove(ref(realtimeDb, `notifications/${currentUser.uid}`));
  };

  if (!currentUser) {
    return <p>Logga in for att se notiscentret.</p>;
  }

  return (
    <div className="notification-card">
      <h2>Notiscenter</h2>
      <p className="notification-meta">Olästa notiser: {unreadCount}</p>

      <div className="notification-actions">
        <button type="button" onClick={handleClearAll} disabled={notifications.length === 0}>
          Rensa alla
        </button>
      </div>

      {isLoading ? <p>Hamtar notiser...</p> : null}

      {!isLoading && notifications.length === 0 ? (
        <p>Inga notiser än.</p>
      ) : (
        <ul className="notification-list">
          {notifications.map((item) => (
            <li
              key={item.id}
              className={`notification-item ${item.isRead ? 'is-read' : 'is-unread'}`}
            >
              <div className="notification-item-header">
                <h4>{item.title || 'Ny händelse i favoritomrade'}</h4>
                <span>{item.createdAt ? new Date(item.createdAt).toLocaleString('sv-SE') : 'Okand tid'}</span>
              </div>
              <p>
                <strong>Område:</strong> {item.locationName || 'Okant område'}
              </p>
              <p>
                <strong>Händelse:</strong> {item.eventName || 'Namn saknas'}
              </p>
              {item.eventDatetime ? (
                <p>
                  <strong>Tid:</strong> {new Date(item.eventDatetime).toLocaleString('sv-SE')}
                </p>
              ) : null}

              <div className="notification-item-actions">
                <Link
                  to={`/events/${item.eventId}`}
                  state={{
                    event: {
                      id: item.eventId,
                      name: item.eventName,
                      datetime: item.eventDatetime,
                      type: item.eventType,
                      summary: item.eventSummary,
                      url: item.eventUrl,
                      location: { name: item.locationName }
                    }
                  }}
                >
                  <button type="button" onClick={() => handleMarkAsRead(item)}>
                    Visa detalj
                  </button>
                </Link>
                {!item.isRead ? (
                  <button type="button" onClick={() => handleMarkAsRead(item)}>
                    Markera som läst
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default NotificationCenter;