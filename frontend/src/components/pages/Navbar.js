import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import styles from "./Navbar.module.css";
import { useAuth } from "../../context/AuthContext";
import { FaChevronDown } from "react-icons/fa";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const { isAuthenticated, isAdmin, logout, user } = useAuth();

  // Profil avatarı için baş harfler
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.username ||
    user?.email ||
    "Mon compte";
  const initials =
    (displayName || "U")
      .split(" ")
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";
  const roleLabel = isAdmin ? "Administrateur" : "Membre";
  const panelTo = isAdmin ? "/admin/dashboard" : "/profile";
  const panelLabel = isAdmin ? "Admin Panel" : "Mon profil";

  // Dışarı tıklanınca dropdown'ı kapat
  useEffect(() => {
    if (!userMenuOpen) return undefined;
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

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
          <Link to="/donate" className={styles.navBtnPrimary}>
            Faire un don
          </Link>

          {isAuthenticated && (
            <div className={styles.userMenu} ref={userMenuRef}>
              <button
                type="button"
                className={styles.userTrigger}
                onClick={() => setUserMenuOpen((o) => !o)}
                aria-haspopup="true"
                aria-expanded={userMenuOpen}
              >
                <span className={styles.userAvatar}>{initials}</span>
                <span className={styles.userInfo}>
                  <span className={styles.userName}>{displayName}</span>
                  <span className={styles.userRole}>{roleLabel}</span>
                </span>
                <FaChevronDown
                  className={`${styles.userChevron} ${
                    userMenuOpen ? styles.userChevronOpen : ""
                  }`}
                />
              </button>

              {userMenuOpen && (
                <div className={styles.userDropdown}>
                  <Link
                    to={panelTo}
                    className={styles.userDropdownItem}
                    onClick={() => setUserMenuOpen(false)}
                  >
                    {panelLabel}
                  </Link>
                  <button
                    type="button"
                    className={`${styles.userDropdownItem} ${styles.userDropdownLogout}`}
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                  >
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          )}
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
