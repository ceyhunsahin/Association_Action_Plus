import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Login.module.css';
import { FaEnvelope, FaLock, FaGoogle } from 'react-icons/fa';
import { Helmet } from 'react-helmet';

const Login = () => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(emailOrUsername, password);
      navigate('/profile');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      // Google login redirects, so no need to navigate
    } catch (err) {
      setError('Erreur lors de la connexion avec Google');
    }
  };

  return (
    <>
      <Helmet>
        <title>Connexion | Action Plus</title>
        <meta name="description" content="Connectez-vous à votre compte Action Plus pour participer à nos événements culturels et interculturels." />
      </Helmet>
      
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <h2 className={styles.loginTitle}>Connexion</h2>
          
          {error && <div className={styles.errorMessage}>{error}</div>}
          
          <form onSubmit={handleSubmit} className={styles.loginForm}>
            <div className={styles.formGroup}>
              <label htmlFor="emailOrUsername">
                <FaEnvelope className={styles.inputIcon} />
                Email ou nom d'utilisateur
              </label>
              <input
                type="text"
                id="emailOrUsername"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                required
                placeholder="Entrez votre email ou nom d'utilisateur"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="password">
                <FaLock className={styles.inputIcon} />
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Entrez votre mot de passe"
              />
            </div>
            
            <button 
              type="submit" 
              className={styles.loginButton}
              disabled={loading}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
          
          <div className={styles.orDivider}>
            <span>OU</span>
          </div>
          
          <button 
            type="button" 
            className={styles.googleButton}
            onClick={handleGoogleLogin}
          >
            <FaGoogle className={styles.googleIcon} />
            Connexion avec Google
          </button>
          
          <div className={styles.registerLink}>
            Pas encore de compte? <Link to="/register">S'inscrire</Link>
          </div>
          
          <div className={styles.adminInfo}>
            <p>Admin Bilgileri:</p>
            <p>Kullanıcı adı: admin</p>
            <p>Şifre: admin123</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login; 