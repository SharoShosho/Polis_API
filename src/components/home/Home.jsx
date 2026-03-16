import React from 'react';
import { Link } from 'react-router-dom';

function Home({ user }) {
  return (
    <div className="welcome-card">
      <p className="welcome-kicker">Polis API</p>
      <h2>Välkommen till polisappen</h2>
      <p className="welcome-text">
        Här kan du se polisstationer, följa aktuella händelser och hantera dina favoriter på ett ställe.
      </p>

      {user ? (
        <>
          <p className="welcome-text">
            Du är inloggad och kan gå vidare till din profil eller dina favoriter.
          </p>
          <div className="welcome-actions">
            <Link to="/profile">
              <button>Gå till min profil</button>
            </Link>
            <Link to="/favorites">
              <button>Visa favoriter</button>
            </Link>
          </div>
        </>
      ) : (
        <>
          <p className="welcome-text">
            Logga in eller skapa ett konto för att spara favoriter och få en personlig profilsida.
          </p>
          <div className="welcome-actions">
            <Link to="/login">
              <button>Logga in</button>
            </Link>
            <Link to="/register">
              <button>Skapa konto</button>
            </Link>
          </div>
        </>
      )}

      <div className="welcome-actions secondary-actions">
        <Link to="/police-stations">
          <button>Se polisstationer</button>
        </Link>
        <Link to="/events">
          <button>Se aktuella händelser</button>
        </Link>
      </div>
    </div>
  );
}

export default Home;