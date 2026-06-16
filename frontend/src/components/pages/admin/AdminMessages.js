import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import styles from "./AdminPages.module.css";
import { FaCheck } from "react-icons/fa";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || window.location.origin;

const AdminMessages = () => {
  const { accessToken } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const authHeader = { Authorization: `Bearer ${accessToken}` };

  const fetchMessages = useCallback(() => {
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/api/admin/contact-messages`, { headers: authHeader })
      .then((res) => setMessages(res.data?.messages || []))
      .catch((err) => {
        console.error("Mesajlar yüklenemedi:", err);
        setMessages([]);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const markAsRead = async (id) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/admin/contact-messages/${id}/read`,
        {},
        { headers: authHeader },
      );
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: "read" } : m)),
      );
    } catch (err) {
      console.error("Okundu işaretleme hatası:", err);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Messages</h1>
          <p className={styles.pageSubtitle}>
            Messages reçus via le formulaire de contact.
          </p>
        </div>
      </div>

      {loading ? (
        <div className={styles.stateMsg}>Chargement des messages…</div>
      ) : messages.length === 0 ? (
        <div className={styles.stateMsg}>Aucun message pour le moment.</div>
      ) : (
        messages.map((m) => {
          const unread = m.status !== "read";
          return (
            <div
              key={m.id}
              className={`${styles.messageItem} ${
                unread ? styles.messageItemUnread : ""
              }`}
            >
              <div className={styles.messageHead}>
                <div className={styles.messageFrom}>
                  {m.name}{" "}
                  <span className={styles.messageEmail}>&lt;{m.email}&gt;</span>
                </div>
                <span
                  className={`${styles.badge} ${
                    unread ? styles.badgeWarn : styles.badgeSuccess
                  }`}
                >
                  {unread ? "Non lu" : "Lu"}
                </span>
              </div>
              {m.subject && (
                <div className={styles.messageSubject}>{m.subject}</div>
              )}
              <p className={styles.messageBody}>{m.message}</p>
              <div className={styles.messageHead}>
                <span className={styles.messageMeta}>{m.created_at}</span>
                {unread && (
                  <button
                    className={styles.iconBtn}
                    onClick={() => markAsRead(m.id)}
                  >
                    <FaCheck /> Marquer comme lu
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default AdminMessages;
