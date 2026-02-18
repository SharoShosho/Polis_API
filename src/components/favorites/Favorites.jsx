import React, { useState, useEffect } from 'react';
import { auth, firestore } from '../../Firebase'; // Justera sökvägen beroende på din mappstruktur

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = auth.currentUser; // Hämta aktuell användare från Firebase Authentication

  useEffect(() => {
    if (user) {
      const unsubscribe = firestore.collection('favorites').doc(user.uid).onSnapshot((doc) => {
        if (doc.exists) {
          setFavorites(doc.data().stations || []);
        } else {
          setFavorites([]);
        }
        setIsLoading(false);
      });

      return () => unsubscribe();  // Rensa abonnemanget
    }
  }, [user]);

  return (
    <div>
      <h3>Favoritstationer</h3>
      {isLoading ? (
        <p>Hämtar favoriter...</p>
      ) : (
        <ul>
          {favorites.map((station) => (
            <li key={station.id}>
              <h4>{station.name}</h4>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Favorites;
