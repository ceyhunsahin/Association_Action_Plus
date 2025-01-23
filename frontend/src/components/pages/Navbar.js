import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Hamburger menü durumu
  const menuRef = useRef(null); // Menüyü referansla takip etmek için

  // Menüyü aç/kapat
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Menü dışına tıklandığında menüyü kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Yönetici kontrolü
  const isAdmin = user && user.role === 'admin'; // Örnek: user.role === 'admin'

  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.navBrand}>
        Action Plus Association Culturelle
      </Link>
      <div className={styles.navLinks}>
        <Link to="/" className={styles.navLink}>
          Accueil
        </Link>
        <Link to="/events" className={styles.navLink}>
          Événements
        </Link>
        <Link to="/about" className={styles.navLink}>
          À propos
        </Link>
        <Link to="/contact" className={styles.navLink}>
          Contact
        </Link>
        {user ? ( // Eğer kullanıcı oturum açmışsa
          <div className={styles.profileButton} onClick={toggleMenu} ref={menuRef}>
            <div className={styles.profileInitial}>
              {user.firstName ? user.firstName[0].toUpperCase() : 'U'} {/* Baş harfi büyük harf yap */}
            </div>
            <span className={styles.profileName}>
              {user.firstName || 'Utilisateur'} {/* Tam adı göster */}
            </span>
            {/* Hamburger menü */}
            {isMenuOpen && (
              <div className={styles.dropdownMenu}>
                {/* Profil bağlantısı */}
                <Link to="/profile" className={styles.dropdownItem}>
                  Profile
                </Link>

                {isAdmin && ( // Yalnızca yöneticiler için "Créer un événement" göster
                  <Link to="/eventcreate" className={`${styles.dropdownItem} ${styles.createEventLink}`}>
                    Créer un événement
                  </Link>
                )}
                <button onClick={logout} className={`${styles.dropdownItem} ${styles.logoutButton}`}>
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        ) : ( // Eğer kullanıcı oturum açmamışsa
          <>
            <Link to="/register" className={styles.navLink}>
              Register
            </Link>
            <Link to="/login" className={styles.navLink}>
              Log in
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;