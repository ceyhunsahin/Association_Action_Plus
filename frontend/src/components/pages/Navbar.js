import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarBrand}>
        <Link to="/" className={styles.brandText}>
          ACTION PLUS
        </Link>
      </div>
      <div className={styles.navLinks}>
        <Link to="/" className={location.pathname === '/' ? styles.activeLink : styles.navLink}>
          Accueil
        </Link>
        <Link to="/about" className={location.pathname === '/about' ? styles.activeLink : styles.navLink}>
          À propos
        </Link>
        <Link to="/events" className={location.pathname === '/events' ? styles.activeLink : styles.navLink}>
          Événements
        </Link>
        {user && user.role === 'admin' && (
          <Link to="/create-event" className={location.pathname === '/create-event' ? styles.activeLink : styles.navLink}>
            Créer un événement
          </Link>
        )}
      </div>
      <div className={styles.authLinks}>
        {user ? (
          <>
            <Link to="/profile" className={location.pathname === '/profile' ? styles.activeLink : styles.navLink}>
              {user.firstName ? user.firstName.charAt(0) : 'P'}
            </Link>
            <button onClick={logout} className={styles.logoutButton}>
              Déconnexion
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className={location.pathname === '/login' ? styles.activeLink : styles.navLink}>
              Connexion
            </Link>
            <Link to="/register" className={location.pathname === '/register' ? styles.activeLink : styles.navLink}>
              Inscription
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;