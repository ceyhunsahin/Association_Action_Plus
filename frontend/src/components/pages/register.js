import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Register.module.css';
import { Helmet } from 'react-helmet';
import googleIcon from '../../assets/google-icon.png';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formError, setFormError] = useState('');
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (formData.password !== formData.confirmPassword) {
      setFormError('Les mots de passe ne correspondent pas');
      return;
    }
    
    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setFormError(err.response?.data?.message || 'Erreur lors de l\'inscription');
    }
  };

  const handleGoogleRegister = async () => {
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      setFormError('Erreur lors de l\'inscription avec Google');
    }
  };

  return (
    <>
      <Helmet>
        <title>Inscription | Action Plus</title>
        <meta name="description" content="Inscrivez-vous à Action Plus pour participer à nos événements culturels et interculturels." />
      </Helmet>
      
      <div className={styles.registerContainer}>
        <div className={styles.registerCard}>
          <h1 className={styles.registerTitle}>Inscription</h1>
          
          {formError && <div className={styles.errorMessage}>{formError}</div>}
          
          <form onSubmit={handleSubmit} className={styles.registerForm}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="firstName">Prénom</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className={styles.formControl}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="lastName">Nom</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className={styles.formControl}
                />
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={styles.formControl}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="password">Mot de passe</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
                className={styles.formControl}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength="6"
                className={styles.formControl}
              />
            </div>
            
            <button type="submit" className={styles.registerButton}>
              S'inscrire
            </button>
          </form>
          
          <div className={styles.divider}>
            <span>ou</span>
          </div>
          
          <button 
            onClick={handleGoogleRegister} 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              padding: '12px',
              backgroundColor: 'white',
              color: '#5d4037',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              marginTop: '20px',
              marginBottom: '20px'
            }}
          >
            <div style={{
              width: '20px',
              height: '20px',
              marginRight: '10px',
              backgroundImage: 'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMTcuNiA5LjJsLS4xLTEuOEg5djMuNGg0LjhDMTMuNiAxMiAxMyAxMyAxMiAxMy42djIuMmgzYTguOCA4LjggMCAwIDAgMi42LTYuNnoiIGZpbGw9IiM0Mjg1RjQiIGZpbGwtcnVsZT0ibm9uemVybyIvPjxwYXRoIGQ9Ik05IDE4YzIuNCAwIDQuNS0uOCA2LTIuMmwtMy0yLjJhNS40IDUuNCAwIDAgMS04LTIuOUgxVjEzYTkgOSAwIDAgMCA4IDV6IiBmaWxsPSIjMzRBODUzIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBkPSJNNCAxMC43YTUuNCA1LjQgMCAwIDEgMC0zLjRWNUgxYTkgOSAwIDAgMCAwIDhsMy0yLjN6IiBmaWxsPSIjRkJCQzA1IiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBkPSJNOSAzLjZjMS4zIDAgMi41LjQgMy40IDEuM0wxNSAyLjNBOSA5IDAgMCAwIDEgNWwzIDIuNGE1LjQgNS40IDAgMCAxIDUtMy43eiIgZmlsbD0iI0VBNDMzNSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZD0iTTAgMGgxOHYxOEgweiIvPjwvZz48L3N2Zz4=")',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat'
            }}></div>
            S'inscrire avec Google
          </button>
          
          <div className={styles.loginLink}>
            Vous avez déjà un compte ? <Link to="/login">Se connecter</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register; 