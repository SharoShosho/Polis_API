import React, { useState } from 'react';
import { auth } from '../../Firebase'; // Importera Firebase Authentication

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();

    auth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        console.log('Inloggad:', userCredential.user);
      })
      .catch((error) => {
        setError(error.message);
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
    </div>
  );
}

export default Login;
