import React, { useState, useEffect, useCallback, Fragment } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import styles from "./AdminPages.module.css";
import { FaPlus, FaEdit, FaTrash, FaUsers } from "react-icons/fa";

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
  // Katılımcılar: hangi event açık + cache + yükleniyor
  const [expandedId, setExpandedId] = useState(null);
  const [participants, setParticipants] = useState({});
  const [loadingParticipants, setLoadingParticipants] = useState(false);

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

  const toggleParticipants = async (ev) => {
    if (expandedId === ev.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(ev.id);
    if (participants[ev.id]) return; // cache'te varsa tekrar çekme
    setLoadingParticipants(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/events/${ev.slug || ev.id}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      setParticipants((prev) => ({
        ...prev,
        [ev.id]: res.data?.participants || [],
      }));
    } catch (err) {
      console.error("Katılımcılar yüklenemedi:", err);
      setParticipants((prev) => ({ ...prev, [ev.id]: [] }));
    } finally {
      setLoadingParticipants(false);
    }
  };

  const handleDelete = async (ev) => {
    const identifier = ev.slug || ev.id;
    if (
      !window.confirm(`Supprimer l'événement « ${ev.title || "sans titre"} » ?`)
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
        <div className={styles.stateMsg}>Aucun événement pour le moment.</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Événement</th>
                <th>Date</th>
                <th>Lieu</th>
                <th>Participants</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => {
                const isOpen = expandedId === ev.id;
                const list = participants[ev.id];
                return (
                  <Fragment key={ev.id}>
                    <tr>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
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
                        <button
                          className={`${styles.iconBtn} ${
                            isOpen ? styles.iconBtnActive : ""
                          }`}
                          onClick={() => toggleParticipants(ev)}
                        >
                          <FaUsers /> {ev.participant_count || 0}
                        </button>
                      </td>
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

                    {isOpen && (
                      <tr>
                        <td colSpan={5} className={styles.participantsCell}>
                          {loadingParticipants && !list ? (
                            <span className={styles.participantsEmpty}>
                              Chargement des participants…
                            </span>
                          ) : list && list.length > 0 ? (
                            <div className={styles.participantsList}>
                              {list.map((p) => (
                                <div key={p.id} className={styles.participantChip}>
                                  <span className={styles.participantName}>
                                    {[p.firstName, p.lastName]
                                      .filter(Boolean)
                                      .join(" ") ||
                                      p.username ||
                                      "Utilisateur"}
                                  </span>
                                  {p.email && (
                                    <span className={styles.participantEmail}>
                                      {p.email}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className={styles.participantsEmpty}>
                              Aucun participant inscrit pour le moment.
                            </span>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminEvents;
