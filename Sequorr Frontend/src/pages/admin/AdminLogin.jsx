import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminLogin } from '../../api/config';
import styles from './AdminLogin.module.css';

const AdminLogin = () => {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError('API Key is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Validate the key with our new backend route
      const res = await adminLogin(apiKey);
      
      await login(res.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Could not connect to the API. Please ensure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <Shield size={32} />
          </div>
          <h1 className={styles.title}>Sequorr Admin</h1>
          <p className={styles.subtitle}>Enter your super secret API key</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="apiKey" className={styles.label}>Admin API Key</label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className={styles.input}
              placeholder="••••••••••••••••"
              autoFocus
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button 
            type="submit" 
            className={styles.button}
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Access Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
