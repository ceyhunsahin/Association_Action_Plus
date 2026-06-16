// Admin Layout — public navbar yerine admin'e özel sol sidebar
import React, { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./AdminLayout.module.css";
import {
  FaThLarge,
  FaCalendarAlt,
  FaPlus,
  FaEnvelope,
  FaUsers,
  FaIdCard,
  FaHandHoldingHeart,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaExternalLinkAlt,
  FaUserCircle,
} from "react-icons/fa";

// Menü grupları (en çok kullanılanlar üstte, event yönetimi ana odak)
const MENU = [
  {
    title: "Général",
    items: [{ to: "/admin/dashboard", label: "Tableau de bord", icon: FaThLarge }],
  },
  {
    title: "Événements",
    items: [
      { to: "/admin/events", label: "Gérer les événements", icon: FaCalendarAlt },
      { to: "/events/create", label: "Ajouter un événement", icon: FaPlus },
    ],
  },
  {
    title: "Communauté",
    items: [
      { to: "/admin/messages", label: "Messages", icon: FaEnvelope },
      { to: "/admin/users", label: "Membres / Utilisateurs", icon: FaUsers },
      { to: "/admin/memberships", label: "Adhésions", icon: FaIdCard },
      { to: "/admin/donations", label: "Dons", icon: FaHandHoldingHeart },
    ],
  },
  {
    title: "Compte",
    items: [
      { to: "/admin/profile", label: "Profil administrateur", icon: FaUserCircle },
      { to: "/admin/settings", label: "Paramètres", icon: FaCog },
    ],
  },
];

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.username ||
    user?.email ||
    "Administrateur";
  const initials = (displayName || "A")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    closeMobile();
    logout();
  };

  return (
    <div className={styles.adminShell}>
      {/* Mobil üst bar */}
      <header className={styles.mobileTopbar}>
        <button
          className={styles.hamburger}
          onClick={() => setMobileOpen(true)}
          aria-label="Ouvrir le menu"
        >
          <FaBars />
        </button>
        <span className={styles.mobileTitle}>Action+ Admin</span>
      </header>

      {/* Mobil overlay */}
      {mobileOpen && <div className={styles.overlay} onClick={closeMobile} />}

      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ""}`}
      >
        <div className={styles.sidebarHeader}>
          <Link to="/admin/dashboard" className={styles.brand} onClick={closeMobile}>
            <img src="/logo.svg" alt="Action+" className={styles.brandLogo} />
            <div className={styles.brandText}>
              <span className={styles.brandName}>Action +</span>
              <span className={styles.brandSub}>Panneau d'administration</span>
            </div>
          </Link>
          <button
            className={styles.closeBtn}
            onClick={closeMobile}
            aria-label="Fermer le menu"
          >
            <FaTimes />
          </button>
        </div>

        {/* Admin profil kartı */}
        <div className={styles.profileCard}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.profileInfo}>
            <span className={styles.profileName}>{displayName}</span>
            <span className={styles.profileRole}>Administrateur</span>
          </div>
        </div>

        {/* Menü */}
        <nav className={styles.nav} aria-label="Navigation administration">
          {MENU.map((group) => (
            <div key={group.title} className={styles.navGroup}>
              <span className={styles.navGroupTitle}>{group.title}</span>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={closeMobile}
                    className={({ isActive }) =>
                      isActive
                        ? `${styles.navLink} ${styles.navLinkActive}`
                        : styles.navLink
                    }
                  >
                    <Icon className={styles.navIcon} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Alt aksiyonlar */}
        <div className={styles.sidebarFooter}>
          <button
            className={styles.viewSiteBtn}
            onClick={() => {
              closeMobile();
              navigate("/");
            }}
          >
            <FaExternalLinkAlt className={styles.navIcon} />
            <span>Voir le site</span>
          </button>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <FaSignOutAlt className={styles.navIcon} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* İçerik alanı */}
      <main className={styles.content}>{children}</main>
    </div>
  );
};

export default AdminLayout;
