import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Navbar.module.css';
import { FaUser, FaSignOutAlt, FaSignInAlt, FaUserPlus } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarBrand}>
        <Link to="/" className={styles.brandLogo}>
          ACTION<span>PLUS</span>
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
      </div>
      <div className={styles.authLinks}>
        {user ? (
          <>
            <Link to="/profile" className={location.pathname === '/profile' ? styles.activeLink : styles.navLink}>
              <FaUser /> {user.username || 'Profil'}
            </Link>
            <button onClick={handleLogout} className={styles.logoutButton}>
              <FaSignOutAlt /> Déconnexion
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className={location.pathname === '/login' ? styles.activeLink : styles.navLink}>
              <FaSignInAlt /> Connexion
            </Link>
            <Link to="/register" className={location.pathname === '/register' ? styles.activeLink : styles.navLink}>
              <FaUserPlus /> Inscription
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;