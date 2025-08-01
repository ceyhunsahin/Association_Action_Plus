import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './ForgotPassword.module.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      // API isteği - backend'e şifre sıfırlama talebi gönder
      const response = await axios.post('https://association-action-plus.onrender.com/api/auth/reset-password-request', { email });
      
      setMessage('Un e-mail de réinitialisation a été envoyé à votre adresse e-mail si elle existe dans notre système.');
      setSubmitted(true);
    } catch (err) {
      console.error('Password reset request error:', err);
      
      // Güvenlik nedeniyle her zaman başarılı mesajı göster
      setMessage('Un e-mail de réinitialisation a été envoyé à votre adresse e-mail si elle existe dans notre système.');
      setSubmitted(true);
      
      // Sadece geliştirme aşamasında hata mesajını göster
      if (process.env.NODE_ENV === 'development') {
        setError(`Erreur de développement: ${err.response?.data?.detail || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.forgotPasswordContainer}>
      <div className={styles.forgotPasswordForm}>
        <h2 className={styles.title}>Mot de passe oublié</h2>
        
        {!submitted ? (
          <>
            <p className={styles.description}>
              Entrez votre adresse e-mail ci-dessous et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>
            
            {error && <div className={styles.error}>{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="email">Adresse e-mail</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Votre adresse e-mail"
                />
              </div>
              
              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
              </button>
            </form>
          </>
        ) : (
          <div className={styles.successMessage}>
            <div className={styles.successIcon}>✓</div>
            <p>{message}</p>
          </div>
        )}
        
        <div className={styles.links}>
          <p>
            <Link to="/login">Retour à la connexion</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 