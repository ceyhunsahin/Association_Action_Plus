import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Navbar.module.css';
import { FaUser, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaCalendarPlus, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll olayını dinle
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      setIsOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  // Kullanıcı adını belirleme fonksiyonu
  const getUserDisplayName = () => {
    if (!user) return '';
    
    if (user.firstName) {
      return user.firstName;
    }
    
    if (user.username) {
      return user.username;
    }
    
    if (user.email) {
      // Email'in @ işaretinden önceki kısmını al
      const username = user.email.split('@')[0];
      // İlk harfi büyük yap
      return username.charAt(0).toUpperCase() + username.slice(1);
    }
    
    return 'Profil';
  };

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ''}`}>
      <div className={styles.navbarContainer}>
        {/* Logo Bölümü */}
        <div className={styles.logoSection}>
          <Link to="/" className={styles.logo}>
            ACTION<span>+</span>
          </Link>
        </div>

        {/* Orta Bölüm - Navigasyon */}
        <div className={styles.navSection}>
          <div className={styles.navLinks}>
            <NavLink 
              to="/" 
              className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}
              onClick={closeMenu}
              end
            >
              Accueil
            </NavLink>
            <NavLink 
              to="/about" 
              className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}
              onClick={closeMenu}
            >
              À propos
            </NavLink>
            <NavLink 
              to="/events" 
              className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}
              onClick={closeMenu}
            >
              Événements
            </NavLink>
            {isAdmin && (
              <NavLink 
                to="/events/create" 
                className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}
                onClick={closeMenu}
              >
                <FaCalendarPlus /> Créer un événement
              </NavLink>
            )}
          </div>
        </div>

        {/* Sağ Bölüm - Kimlik Doğrulama */}
        <div className={styles.authSection}>
          <div className={styles.authLinks}>
            {user ? (
              <>
                <Link 
                  to="/profile" 
                  className={styles.profileButton}
                  onClick={closeMenu}
                >
                  <FaUser /> {getUserDisplayName()}
                </Link>
                <button onClick={handleLogout} className={styles.logoutButton}>
                  <FaSignOutAlt /> Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={styles.loginButton} onClick={closeMenu}>
                  <FaSignInAlt /> Connexion
                </Link>
                <Link to="/register" className={styles.registerButton} onClick={closeMenu}>
                  <FaUserPlus /> Inscription
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobil Menü Düğmesi */}
        <button 
          className={styles.menuToggle}
          onClick={toggleMenu}
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobil Menü */}
      {isOpen && (
        <div className={`${styles.navbarMobile} ${isOpen ? styles.navbarMobileActive : ''}`}>
          <div className={styles.navLinksMobile}>
            <NavLink 
              to="/" 
              className={({ isActive }) => isActive ? styles.activeLinkMobile : styles.navLinkMobile}
              onClick={closeMenu}
              end
            >
              Accueil
            </NavLink>
            <NavLink 
              to="/about" 
              className={({ isActive }) => isActive ? styles.activeLinkMobile : styles.navLinkMobile}
              onClick={closeMenu}
            >
              À propos
            </NavLink>
            <NavLink 
              to="/events" 
              className={({ isActive }) => isActive ? styles.activeLinkMobile : styles.navLinkMobile}
              onClick={closeMenu}
            >
              Événements
            </NavLink>
            {isAdmin && (
              <NavLink 
                to="/events/create" 
                className={({ isActive }) => isActive ? styles.activeLinkMobile : styles.navLinkMobile}
                onClick={closeMenu}
              >
                <FaCalendarPlus /> Créer un événement
              </NavLink>
            )}
          </div>
          
          <div className={styles.authLinksMobile}>
            {user ? (
              <>
                <Link 
                  to="/profile" 
                  className={styles.profileMobileItem}
                  onClick={closeMenu}
                >
                  <FaUser className={styles.profileMobileIcon} /> 
                  {getUserDisplayName()}
                </Link>
                <button onClick={handleLogout} className={styles.logoutButtonMobile}>
                  <FaSignOutAlt className={styles.profileMobileIcon} /> Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={styles.loginButtonMobile}
                  onClick={closeMenu}
                >
                  <FaSignInAlt /> Connexion
                </Link>
                <Link 
                  to="/register" 
                  className={styles.registerButtonMobile}
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