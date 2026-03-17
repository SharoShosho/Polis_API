import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteUser, onAuthStateChanged, signOut } from 'firebase/auth';
import { get, ref, remove, set } from 'firebase/database';
import { auth, realtimeDb } from '../../Firebase';

const RECENT_LOGIN_WINDOW_MS = 5 * 60 * 1000;

const getDeleteAccountErrorMessage = (code) => {
  switch (code) {
    case 'auth/requires-recent-login':
      return 'Av säkerhetsskäl behöver du logga in igen innan kontot kan raderas.';
    case 'auth/network-request-failed':
      return 'Nätverksfel. Kontrollera din uppkoppling och försök igen.';
    default:
      return 'Kunde inte radera kontot. Försök igen.';
  }
};

function Profile() {
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser) {
        setProfile(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const snapshot = await get(ref(realtimeDb, `users/${currentUser.uid}`));
        setProfile(snapshot.val());
      } catch (loadError) {
        setError('Kunde inte hämta profiluppgifter just nu.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [currentUser]);

  const handleLogout = async () => {
    setError('');

    try {
      await signOut(auth);
      navigate('/login');
    } catch (logoutError) {
      setError('Kunde inte logga ut just nu.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) {
      return;
    }

    const confirmed = window.confirm(
      'Är du säker på att du vill radera ditt konto? Alla sparade profiluppgifter och favoriter tas bort permanent.'
    );

    if (!confirmed) {
      return;
    }

    const lastSignInTime = currentUser.metadata?.lastSignInTime
      ? new Date(currentUser.metadata.lastSignInTime).getTime()
      : 0;

    if (!lastSignInTime || Date.now() - lastSignInTime > RECENT_LOGIN_WINDOW_MS) {
      setError('Logga in igen och försök sedan radera kontot för att bekräfta att det verkligen är du.');
      return;
    }

    setIsDeleting(true);
    setError('');

    let backups = [];

    try {
      const [userSnapshot, favoritesSnapshot, tokensSnapshot, notificationsSnapshot] = await Promise.all([
        get(ref(realtimeDb, `users/${currentUser.uid}`)),
        get(ref(realtimeDb, `favorites/${currentUser.uid}`)),
        get(ref(realtimeDb, `notificationTokens/${currentUser.uid}`)),
        get(ref(realtimeDb, `notifications/${currentUser.uid}`))
      ]);

      backups = [
        {
          path: `users/${currentUser.uid}`,
          data: userSnapshot.val()
        },
        {
          path: `favorites/${currentUser.uid}`,
          data: favoritesSnapshot.val()
        },
        {
          path: `notificationTokens/${currentUser.uid}`,
          data: tokensSnapshot.val()
        },
        {
          path: `notifications/${currentUser.uid}`,
          data: notificationsSnapshot.val()
        }
      ];

      await Promise.all([
        remove(ref(realtimeDb, `users/${currentUser.uid}`)),
        remove(ref(realtimeDb, `favorites/${currentUser.uid}`)),
        remove(ref(realtimeDb, `notificationTokens/${currentUser.uid}`)),
        remove(ref(realtimeDb, `notifications/${currentUser.uid}`))
      ]);

      await deleteUser(currentUser);
      navigate('/register');
    } catch (deleteError) {
      try {
        await Promise.all(
          backups.map((backup) => {
            if (backup.data === null) {
              return remove(ref(realtimeDb, backup.path));
            }

            return set(ref(realtimeDb, backup.path), backup.data);
          })
        );
      } catch (restoreError) {
        // Ignore restore failures here and show the original deletion error.
      }

      setError(getDeleteAccountErrorMessage(deleteError.code));
    } finally {
      setIsDeleting(false);
    }
  };

  if (!currentUser) {
    return <p>Logga in för att se din profilsida.</p>;
  }

  return (
    <div className="profile-card">
      <h2>Min profil</h2>
      {isLoading ? <p>Hämtar profiluppgifter...</p> : null}
      {!isLoading ? (
        <div className="profile-details">
          <div className="profile-row">
            <span>Namn</span>
            <strong>{profile?.fullName || 'Ej angivet'}</strong>
          </div>
          <div className="profile-row">
            <span>E-post</span>
            <strong>{profile?.email || currentUser.email || 'Ej angivet'}</strong>
          </div>
          <div className="profile-row">
            <span>Konto skapat</span>
            <strong>
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleString('sv-SE')
                : 'Datum saknas'}
            </strong>
          </div>
          <div className="profile-row">
            <span>Senaste inloggning</span>
            <strong>
              {currentUser.metadata?.lastSignInTime
                ? new Date(currentUser.metadata.lastSignInTime).toLocaleString('sv-SE')
                : 'Datum saknas'}
            </strong>
          </div>
        </div>
      ) : null}

      <div className="profile-actions">
        <button type="button" onClick={handleLogout} disabled={isDeleting}>
          Logga ut
        </button>
        <button
          type="button"
          className="danger-button"
          onClick={handleDeleteAccount}
          disabled={isDeleting}
        >
          {isDeleting ? 'Raderar konto...' : 'Radera konto'}
        </button>
      </div>

      {error ? <p className="auth-error">{error}</p> : null}
    </div>
  );
}

export default Profile;