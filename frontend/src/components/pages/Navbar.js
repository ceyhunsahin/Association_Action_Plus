import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Navbar.module.css';
import { FaUser, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaCalendarPlus, FaBars, FaTimes, FaEnvelope, FaUsers, FaHandHoldingHeart } from 'react-icons/fa';
import { getDonation } from '../../services/donationService';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [pendingDonation, setPendingDonation] = useState(false);
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

  useEffect(() => {
    const checkPendingDonation = async () => {
      if (!user) {
        setPendingDonation(false);
        return;
      }
      const lastDonationId = localStorage.getItem('lastDonationId');
      if (!lastDonationId) {
        setPendingDonation(false);
        return;
      }
      try {
        const donation = await getDonation(lastDonationId);
        setPendingDonation(donation?.status !== 'COMPLETED');
      } catch {
        setPendingDonation(false);
      }
    };
    checkPendingDonation();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
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
    setAdminMenuOpen(false);
  };

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    if (isOpen) {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      body.dataset.menuScrollY = String(scrollY);
      body.classList.add('menu-open');

      // iOS + mobile safe scroll lock
      html.style.overflow = 'hidden';
      body.style.overflow = 'hidden';
      body.style.position = 'fixed';
      body.style.top = `-${scrollY}px`;
      body.style.left = '0';
      body.style.right = '0';
      body.style.width = '100%';
    } else {
      const saved = parseInt(body.dataset.menuScrollY || '0', 10);
      body.classList.remove('menu-open');

      html.style.overflow = '';
      body.style.overflow = '';
      body.style.position = '';
      body.style.top = '';
      body.style.left = '';
      body.style.right = '';
      body.style.width = '';
      window.scrollTo(0, Number.isNaN(saved) ? 0 : saved);
      delete body.dataset.menuScrollY;
    }

    return () => {
      const saved = parseInt(body.dataset.menuScrollY || '0', 10);
      body.classList.remove('menu-open');
      html.style.overflow = '';
      body.style.overflow = '';
      body.style.position = '';
      body.style.top = '';
      body.style.left = '';
      body.style.right = '';
      body.style.width = '';
      if (!Number.isNaN(saved)) {
        window.scrollTo(0, saved);
      }
      delete body.dataset.menuScrollY;
    };
  }, [isOpen]);

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
    <nav className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ''} ${isAdmin ? styles.navbarAdmin : styles.navbarNormal}`}>
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
            <NavLink 
              to="/contact" 
              className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}
              onClick={closeMenu}
            >
              <FaEnvelope className={styles.navIcon} /> Contact
            </NavLink>
            <NavLink 
              to="/donate" 
              className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}
              onClick={closeMenu}
            >
              <FaHandHoldingHeart className={styles.navIcon} /> Faire un don
              {pendingDonation && <span className={styles.pendingBadge}>En attente</span>}
            </NavLink>
            {isAdmin && (
              <div className={styles.adminDropdown}>
                <button
                  type="button"
                  className={styles.adminButton}
                  onClick={() => setAdminMenuOpen((v) => !v)}
                >
                  <FaUsers /> Opérations
                </button>
                {adminMenuOpen && (
                  <div className={styles.adminMenu}>
                    <NavLink 
                      to="/events/create" 
                      className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}
                      onClick={closeMenu}
                    >
                      <FaCalendarPlus /> Créer un événement
                    </NavLink>
                    <NavLink 
                      to="/admin/memberships" 
                      className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}
                      onClick={closeMenu}
                    >
                      <FaUsers /> Adhésions
                    </NavLink>
                    <NavLink 
                      to="/admin/donations" 
                      className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}
                      onClick={closeMenu}
                    >
                      <FaHandHoldingHeart /> Dons
                    </NavLink>
                  </div>
                )}
              </div>
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
        <>
          <div className={styles.menuOverlay} onClick={closeMenu} />
          <div className={`${styles.navbarMobile} ${isOpen ? styles.navbarMobileActive : ''}`}>
          <div className={`${isAdmin ? styles.navLinksMobileAdmin : styles.navLinksMobileNormal} ${styles.navLinksMobile}`}>
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
            <NavLink 
              to="/contact" 
              className={({ isActive }) => isActive ? styles.activeLinkMobile : styles.navLinkMobile}
              onClick={closeMenu}
            >
              <FaEnvelope className={styles.navIcon} /> Contact
            </NavLink>
            <NavLink 
              to="/donate" 
              className={({ isActive }) => isActive ? styles.activeLinkMobile : styles.navLinkMobile}
              onClick={closeMenu}
            >
              <FaHandHoldingHeart className={styles.navIcon} /> Faire un don
              {pendingDonation && <span className={styles.pendingBadge}>En attente</span>}
            </NavLink>
            {isAdmin && (
              <>
                <NavLink 
                  to="/events/create" 
                  className={({ isActive }) => isActive ? styles.activeLinkMobile : styles.navLinkMobile}
                  onClick={closeMenu}
                >
                  <FaCalendarPlus /> Créer un événement
                </NavLink>
                <NavLink 
                  to="/admin/memberships" 
                  className={({ isActive }) => isActive ? styles.activeLinkMobile : styles.navLinkMobile}
                  onClick={closeMenu}
                >
                  <FaUsers /> Adhésions
                </NavLink>
                <NavLink 
                  to="/admin/donations" 
                  className={({ isActive }) => isActive ? styles.activeLinkMobile : styles.navLinkMobile}
                  onClick={closeMenu}
                >
                  <FaHandHoldingHeart /> Dons
                </NavLink>
              </>
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
        </>
      )}
    </nav>
  );
};

export default Navbar;
