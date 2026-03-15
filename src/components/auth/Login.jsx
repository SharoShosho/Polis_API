import React, { useState } from 'react';
import { auth } from '../../Firebase'; // Importera Firebase Authentication
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Link } from 'react-router-dom';

const getLoginErrorMessage = (code) => {
  switch (code) {
    case 'auth/invalid-email':
      return 'Ogiltig e-postadress.';
    case 'auth/invalid-credential':
      return 'Fel e-post eller losenord.';
    case 'auth/user-disabled':
      return 'Kontot ar inaktiverat.';
    case 'auth/network-request-failed':
      return 'Natverksfel. Kontrollera din uppkoppling och forsok igen.';
    case 'auth/too-many-requests':
      return 'For manga forsok. Vanta en stund och prova igen.';
    case 'auth/configuration-not-found':
      return 'Inloggningsmetoden ar inte aktiverad i Firebase Authentication.';
    default:
      return 'Inloggningen misslyckades. Forsok igen.';
  }
};

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log('Inloggad:', userCredential.user);
      })
      .catch((error) => {
        setError(getLoginErrorMessage(error.code));
      });
  };

  return (
    <div>
      <h2>Logga in</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="E-post"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Lösenord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Logga in</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p style={{ marginTop: '12px' }}>
        Har du inget konto? <Link to="/register">Registrera dig</Link>
      </p>
    </div>
  );
}

export default Login;
