import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Navbar.module.css';
import { FaBars, FaTimes, FaHome, FaCalendarAlt, FaUsers, FaInfoCircle, FaEnvelope, FaSignInAlt, FaUserPlus } from 'react-icons/fa';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState('');
  const location = useLocation();
  const navItemsRef = useRef([]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Temizleme fonksiyonu
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    setActiveLink(location.pathname);
    setIsOpen(false);
  }, [location]);

  useEffect(() => {
    if (isOpen) {
      // Menü açıldığında her öğeye animasyon için index atama
      navItemsRef.current.forEach((item, index) => {
        if (item) {
          item.style.setProperty('--item-index', index + 1);
        }
      });
    }
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.navbarContainer}>
        <div className={styles.navbarLogo}>
          <Link to="/" className={styles.logoLink}>
            <div className={styles.logoWrapper}>
              <img src="/logo.svg" alt="Action Plus Logo" className={styles.logo} />
              <div className={styles.logoGlow}></div>
            </div>
            <div className={styles.logoText}>
              <span className={styles.logoFirstLetter}>A</span>CTION
              <span className={styles.logoSpacer}></span>
              <span className={styles.logoFirstLetter}>P</span>LUS
            </div>
          </Link>
        </div>

        <div className={styles.menuButton} onClick={toggleMenu}>
          {isOpen ? <FaTimes /> : <FaBars />}
          <div className={styles.menuButtonRipple}></div>
        </div>

        <div className={`${styles.navbarLinks} ${isOpen ? styles.active : ''}`}>
          <div className={styles.navbarLinksBackground}></div>
          <ul className={styles.navMenu}>
            <li 
              className={styles.navItem} 
              ref={el => navItemsRef.current[0] = el}
            >
              <Link 
                to="/" 
                className={`${styles.navLink} ${activeLink === '/' ? styles.active : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <FaHome className={styles.navIcon} />
                <span className={styles.navText}>Accueil</span>
                <div className={styles.navLinkHighlight}></div>
              </Link>
            </li>
            <li 
              className={styles.navItem}
              ref={el => navItemsRef.current[1] = el}
            >
              <Link 
                to="/events" 
                className={`${styles.navLink} ${activeLink === '/events' ? styles.active : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <FaCalendarAlt className={styles.navIcon} />
                <span className={styles.navText}>Événements</span>
                <div className={styles.navLinkHighlight}></div>
              </Link>
            </li>
            <li 
              className={styles.navItem}
              ref={el => navItemsRef.current[2] = el}
            >
              <Link 
                to="/about" 
                className={`${styles.navLink} ${activeLink === '/about' ? styles.active : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <FaInfoCircle className={styles.navIcon} />
                <span className={styles.navText}>À propos</span>
                <div className={styles.navLinkHighlight}></div>
              </Link>
            </li>
            <li 
              className={styles.navItem}
              ref={el => navItemsRef.current[3] = el}
            >
              <Link 
                to="/members" 
                className={`${styles.navLink} ${activeLink === '/members' ? styles.active : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <FaUsers className={styles.navIcon} />
                <span className={styles.navText}>Membres</span>
                <div className={styles.navLinkHighlight}></div>
              </Link>
            </li>
            <li 
              className={styles.navItem}
              ref={el => navItemsRef.current[4] = el}
            >
              <Link 
                to="/contact" 
                className={`${styles.navLink} ${activeLink === '/contact' ? styles.active : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <FaEnvelope className={styles.navIcon} />
                <span className={styles.navText}>Contact</span>
                <div className={styles.navLinkHighlight}></div>
              </Link>
            </li>
          </ul>
          
          <div className={styles.navbarAuth}>
            <Link to="/login" className={styles.loginButton}>
              <FaSignInAlt className={styles.authIcon} />
              <span>Connexion</span>
            </Link>
            <Link to="/register" className={styles.registerButton}>
              <FaUserPlus className={styles.authIcon} />
              <span>Inscription</span>
              <div className={styles.buttonGlow}></div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 