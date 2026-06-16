import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import styles from "./AdminPages.module.css";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || window.location.origin;

const resolveMediaUrl = (url) => {
  if (!url) return "/assets/home-hero.png";
  return url.startsWith("/uploads/") ? `${API_BASE_URL}${url}` : url;
};

const AdminEvents = () => {
  const { accessToken } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(() => {
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/api/events`)
      .then((res) => setEvents(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error("Événements yüklenemedi:", err);
        setEvents([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDelete = async (ev) => {
    const identifier = ev.slug || ev.id;
    if (
      !window.confirm(
        `Supprimer l'événement « ${ev.title || "sans titre"} » ?`,
      )
    )
      return;
    try {
      await axios.delete(`${API_BASE_URL}/api/events/${identifier}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setEvents((prev) => prev.filter((e) => e.id !== ev.id));
    } catch (err) {
      console.error("Silme hatası:", err);
      alert("Une erreur s'est produite lors de la suppression.");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Gérer les événements</h1>
          <p className={styles.pageSubtitle}>
            {events.length} événement(s) au total.
          </p>
        </div>
        <Link to="/events/create" className={styles.primaryBtn}>
          <FaPlus /> Ajouter un événement
        </Link>
      </div>

      {loading ? (
        <div className={styles.stateMsg}>Chargement des événements…</div>
      ) : events.length === 0 ? (
        <div className={styles.stateMsg}>
          Aucun événement pour le moment.
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Événement</th>
                <th>Date</th>
                <th>Lieu</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id}>
                  <td>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <img
                        className={styles.thumb}
                        src={resolveMediaUrl(ev.image)}
                        alt=""
                        onError={(e) => {
                          e.currentTarget.src = "/assets/home-hero.png";
                        }}
                      />
                      <span className={styles.cellStrong}>
                        {ev.title || "Sans titre"}
                      </span>
                    </div>
                  </td>
                  <td>{ev.date || "—"}</td>
                  <td>{ev.location || "—"}</td>
                  <td>
                    <div
                      className={styles.rowActions}
                      style={{ justifyContent: "flex-end" }}
                    >
                      <Link
                        to={`/events/edit/${ev.slug || ev.id}`}
                        className={styles.iconBtn}
                      >
                        <FaEdit /> Modifier
                      </Link>
                      <button
                        className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                        onClick={() => handleDelete(ev)}
                      >
                        <FaTrash /> Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminEvents;
