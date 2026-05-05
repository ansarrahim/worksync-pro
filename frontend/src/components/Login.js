import React, { useState } from 'react';
import api from '../api';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async (nextUsername, nextPassword) => {
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/login', {
        username: nextUsername.trim().toUpperCase(),
        password: nextPassword
      });

      const { token, user } = response.data;
      onLogin(user, token);
    } catch (err) {
      if (!err.response) {
        setError('Backend is not reachable. Check your API URL and backend deployment.');
      } else {
        setError(err.response?.data?.error || 'Login failed. Check the username and password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(username, password);
  };

  const demoLogin = (user) => {
    setUsername(user);
    setPassword('password123');
    login(user, 'password123');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="brand-mark">WS</div>
        <h1>WorkSync Pro</h1>
        <p>Team operations for YouTube, trading, and daily updates.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="SHAHKAR, ABRAR, or ANSAR"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {error && <div className="error-message">{error}</div>}
        </form>

        <div className="demo-credentials">
          <p><strong>Demo Accounts</strong></p>
          <p>All passwords: <strong>password123</strong></p>
          <div className="demo-actions">
            <button
              type="button"
              className="demo-btn manager"
              onClick={() => demoLogin('SHAHKAR')}
              disabled={loading}
            >
              SHAHKAR
            </button>
            <button
              type="button"
              className="demo-btn trading"
              onClick={() => demoLogin('ABRAR')}
              disabled={loading}
            >
              ABRAR
            </button>
            <button
              type="button"
              className="demo-btn youtube"
              onClick={() => demoLogin('ANSAR')}
              disabled={loading}
            >
              ANSAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
