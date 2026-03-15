import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, realtimeDb } from '../../Firebase';

const getRegisterErrorMessage = (code) => {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Den har e-postadressen anvands redan.';
    case 'auth/invalid-email':
      return 'Ogiltig e-postadress.';
    case 'auth/weak-password':
      return 'Losenordet ar for svagt. Anvand minst 6 tecken.';
    case 'auth/network-request-failed':
      return 'Natverksfel. Kontrollera din uppkoppling och forsok igen.';
    case 'auth/configuration-not-found':
      return 'Inloggningsmetoden ar inte aktiverad i Firebase Authentication.';
    default:
      return 'Nagot gick fel vid registrering. Forsok igen.';
  }
};

function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Losenorden matchar inte.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Losenordet maste vara minst 6 tecken.');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const { uid } = userCredential.user;

      await set(ref(realtimeDb, `users/${uid}`), {
        fullName: formData.fullName,
        email: formData.email,
        createdAt: new Date().toISOString()
      });

      setSuccess('Registrering lyckades! Du skickas till inloggning...');

      setTimeout(() => {
        navigate('/login');
      }, 1200);
    } catch (err) {
      setError(getRegisterErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>Registrera konto</h2>
      <form onSubmit={handleRegister} className="auth-form">
        <input
          type="text"
          name="fullName"
          placeholder="Fullstandigt namn"
          value={formData.fullName}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="E-post"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Losenord"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Bekrafta losenord"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Registrerar...' : 'Registrera'}
        </button>
      </form>

      {error && <p className="auth-error">{error}</p>}
      {success && <p className="auth-success">{success}</p>}

      <p style={{ marginTop: '12px' }}>
        Har du redan ett konto? <Link to="/login">Logga in</Link>
      </p>
    </div>
  );
}

export default Register;
