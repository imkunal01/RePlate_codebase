import { useState } from 'react';
import { login, getGoogleAuthUrl } from '../services/authService';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        onLoginSuccess(result.data);
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await getGoogleAuthUrl();
      
      if (result.success) {
        window.location.href = result.url;
      } else {
        setError(result.message || 'Failed to get Google login URL');
      }
    } catch (err) {
      setError('An error occurred with Google login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login to RePlate</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <div className="divider">OR</div>
      
      <button 
        className="google-login-btn" 
        onClick={handleGoogleLogin}
        disabled={loading}
      >
        Login with Google
      </button>
    </div>
  );
};

export default Login;