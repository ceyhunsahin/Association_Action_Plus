import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import styles from "./AdminPages.module.css";
import {
  FaCalendarAlt,
  FaUsers,
  FaEye,
  FaClock,
  FaHistory,
  FaPlus,
  FaEnvelope,
  FaIdCard,
  FaHandHoldingHeart,
} from "react-icons/fa";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || window.location.origin;

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/stats`)
      .then((res) => setStats(res.data || {}))
      .catch((err) => {
        console.error("Stats yüklenemedi:", err);
        setStats({});
      });
  }, []);

  const statCards = [
    { key: "events", label: "Événements", icon: FaCalendarAlt },
    { key: "events_upcoming", label: "À venir", icon: FaClock },
    { key: "events_past", label: "Passés", icon: FaHistory },
    { key: "members", label: "Membres", icon: FaUsers },
    { key: "visitors", label: "Visiteurs", icon: FaEye },
  ];

  const quickActions = [
    { to: "/events/create", label: "Ajouter un événement", icon: FaPlus },
    { to: "/admin/events", label: "Gérer les événements", icon: FaCalendarAlt },
    { to: "/admin/messages", label: "Voir les messages", icon: FaEnvelope },
    { to: "/admin/users", label: "Membres / Utilisateurs", icon: FaUsers },
    { to: "/admin/memberships", label: "Adhésions", icon: FaIdCard },
    { to: "/admin/donations", label: "Dons", icon: FaHandHoldingHeart },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Tableau de bord</h1>
          <p className={styles.pageSubtitle}>
            Vue d'ensemble et accès rapide à la gestion du site.
          </p>
        </div>
        <Link to="/events/create" className={styles.primaryBtn}>
          <FaPlus /> Nouvel événement
        </Link>
      </div>

      <div className={styles.statsGrid}>
        {statCards.map(({ key, label, icon: Icon }) => (
          <div key={key} className={styles.statCard}>
            <div className={styles.statIcon}>
              <Icon />
            </div>
            <div>
              <div className={styles.statValue}>
                {stats ? (stats[key] ?? 0) : "…"}
              </div>
              <div className={styles.statLabel}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Actions rapides</h2>
        <div className={styles.quickGrid}>
          {quickActions.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className={styles.quickAction}>
              <span className={styles.quickIcon}>
                <Icon />
              </span>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
