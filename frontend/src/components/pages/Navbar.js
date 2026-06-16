import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import styles from "./Navbar.module.css";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <header className={styles.navbar}>
      <div className={styles.navContainer}>
        {/* Logo */}
        <Link to="/" className={styles.navLogo}>
          <img
            src="/logo.svg"
            alt="Action+ logo"
            className={styles.navLogoImg}
          />
          <div className={styles.navLogoText}>
            <span className={styles.navLogoName}>Action +</span>
            <span className={styles.navLogoSub}>Association Action Plus</span>
          </div>
        </Link>

        {/* Linkler */}
        <nav className={styles.navLinks} aria-label="Navigation principale">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive
                ? `${styles.navLink} ${styles.navLinkActive}`
                : styles.navLink
            }
          >
            Accueil
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive
                ? `${styles.navLink} ${styles.navLinkActive}`
                : styles.navLink
            }
          >
            À propos
          </NavLink>
          <NavLink
            to="/events"
            className={({ isActive }) =>
              isActive
                ? `${styles.navLink} ${styles.navLinkActive}`
                : styles.navLink
            }
          >
            Événements
          </NavLink>
        </nav>

        {/* Butonlar */}
        <div className={styles.navRight}>
          {!isAuthenticated && (
            <Link to="/login" className={styles.navBtnSecondary}>
              Connexion
            </Link>
          )}
          {isAuthenticated && isAdmin && (
            <Link to="/admin/dashboard" className={styles.navBtnSecondary}>
              Admin
            </Link>
          )}
          {isAuthenticated && !isAdmin && (
            <Link to="/profile" className={styles.navBtnSecondary}>
              Mon profil
            </Link>
          )}
          {isAuthenticated && (
            <button
              type="button"
              onClick={logout}
              className={styles.navBtnSecondary}
            >
              Déconnexion
            </button>
          )}
          <Link to="/donate" className={styles.navBtnPrimary}>
            Faire un don
          </Link>
        </div>

        {/* Mobil Menü */}
        <button
          className={styles.navBurger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Ouvrir le menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobil Menü İçeriği */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className={styles.mobileLink}
          >
            Accueil
          </Link>
          <Link
            to="/about"
            onClick={() => setMenuOpen(false)}
            className={styles.mobileLink}
          >
            À propos
          </Link>
          <Link
            to="/events"
            onClick={() => setMenuOpen(false)}
            className={styles.mobileLink}
          >
            Événements
          </Link>
          <div className={styles.mobileDivider} />
          <Link
            to="/contact"
            onClick={() => setMenuOpen(false)}
            className={styles.mobileLink}
          >
            Contact
          </Link>
          {!isAuthenticated && (
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className={styles.mobileLink}
            >
              Connexion
            </Link>
          )}
          {isAuthenticated && isAdmin && (
            <Link
              to="/admin/dashboard"
              onClick={() => setMenuOpen(false)}
              className={styles.mobileLink}
            >
              Admin
            </Link>
          )}
          {isAuthenticated && !isAdmin && (
            <Link
              to="/profile"
              onClick={() => setMenuOpen(false)}
              className={styles.mobileLink}
            >
              Mon profil
            </Link>
          )}
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                logout();
              }}
              className={`${styles.mobileLink} ${styles.mobileLogoutBtn}`}
            >
              Déconnexion
            </button>
          )}
          <Link
            to="/donate"
            onClick={() => setMenuOpen(false)}
            className={`${styles.mobileLink} ${styles.mobileLinkPrimary}`}
          >
            Faire un don
          </Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;
