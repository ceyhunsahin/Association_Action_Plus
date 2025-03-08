import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Navbar.module.css';
import { FaUser, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaCalendarPlus, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link to="/" className={styles.logoLink}>
          <div className={styles.brandLogo}>
            <span className={styles.brandAction}>ACTION</span>
            <span className={styles.brandPlus}>+</span>
          </div>
        </Link>
      </div>
      
      <button className={styles.menuToggle} onClick={toggleMenu}>
        {menuOpen ? <FaTimes /> : <FaBars />}
      </button>
      
      <div className={`${styles.navLinks} ${menuOpen ? styles.navLinksMobile : ''}`}>
        <Link 
          to="/" 
          className={location.pathname === '/' ? styles.activeLink : styles.navLink}
          onClick={closeMenu}
        >
          Accueil
        </Link>
        <Link 
          to="/about" 
          className={location.pathname === '/about' ? styles.activeLink : styles.navLink}
          onClick={closeMenu}
        >
          À propos
        </Link>
        <Link 
          to="/events" 
          className={location.pathname === '/events' ? styles.activeLink : styles.navLink}
          onClick={closeMenu}
        >
          Événements
        </Link>
        {isAdmin && (
          <Link 
            to="/events/create" 
            className={location.pathname === '/events/create' ? styles.activeLink : styles.navLink}
            onClick={closeMenu}
          >
            <FaCalendarPlus /> Créer un événement
          </Link>
        )}
      </div>
      
      <div className={`${styles.authLinks} ${menuOpen ? styles.authLinksMobile : ''}`}>
        {user ? (
          <>
            <Link 
              to="/profile" 
              className={location.pathname === '/profile' ? styles.activeLink : styles.navLink}
              onClick={closeMenu}
            >
              <FaUser /> {user.firstName || user.username || 'Profil'}
            </Link>
            <button onClick={handleLogout} className={styles.logoutButton}>
              <FaSignOutAlt /> Déconnexion
            </button>
          </>
        ) : (
          <>
            <Link 
              to="/login" 
              className={location.pathname === '/login' ? styles.activeLink : styles.navLink}
              onClick={closeMenu}
            >
              <FaSignInAlt /> Connexion
            </Link>
            <Link 
              to="/register" 
              className={location.pathname === '/register' ? styles.activeLink : styles.navLink}
              onClick={closeMenu}
            >
              <FaUserPlus /> Inscription
            </Link>
          </>
        )}
      </div>
      
      {menuOpen && (
        <div className={styles.navbarMobile}>
          <div className={styles.navLinksMobile}>
            <Link 
              to="/" 
              className={location.pathname === '/' ? styles.activeLinkMobile : styles.navLinkMobile}
              onClick={closeMenu}
            >
              Accueil
            </Link>
            <Link 
              to="/about" 
              className={location.pathname === '/about' ? styles.activeLinkMobile : styles.navLinkMobile}
              onClick={closeMenu}
            >
              À propos
            </Link>
            <Link 
              to="/events" 
              className={location.pathname === '/events' ? styles.activeLinkMobile : styles.navLinkMobile}
              onClick={closeMenu}
            >
              Événements
            </Link>
            {isAdmin && (
              <Link 
                to="/events/create" 
                className={location.pathname === '/events/create' ? styles.activeLinkMobile : styles.navLinkMobile}
                onClick={closeMenu}
              >
                <FaCalendarPlus /> Créer un événement
              </Link>
            )}
          </div>
          
          <div className={styles.authLinksMobile}>
            {user ? (
              <>
                <Link 
                  to="/profile" 
                  className={location.pathname === '/profile' ? styles.activeLinkMobile : styles.navLinkMobile}
                  onClick={closeMenu}
                >
                  <FaUser /> {user.firstName || user.username || 'Profil'}
                </Link>
                <button onClick={handleLogout} className={`${styles.logoutButton} ${styles.logoutButtonMobile}`}>
                  <FaSignOutAlt /> Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={location.pathname === '/login' ? styles.activeLinkMobile : styles.navLinkMobile}
                  onClick={closeMenu}
                >
                  <FaSignInAlt /> Connexion
                </Link>
                <Link 
                  to="/register" 
                  className={location.pathname === '/register' ? styles.activeLinkMobile : styles.navLinkMobile}
                  onClick={closeMenu}
                >
                  <FaUserPlus /> Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;