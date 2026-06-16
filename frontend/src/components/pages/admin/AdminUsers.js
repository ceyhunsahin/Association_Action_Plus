import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import styles from "./AdminPages.module.css";
import { FaIdCard } from "react-icons/fa";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || window.location.origin;

const AdminUsers = () => {
  const { accessToken } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(() => {
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/api/admin/members`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((res) => setMembers(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error("Üyeler yüklenemedi:", err);
        setMembers([]);
      })
      .finally(() => setLoading(false));
  }, [accessToken]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Membres / Utilisateurs</h1>
          <p className={styles.pageSubtitle}>
            {members.length} utilisateur(s) enregistré(s).
          </p>
        </div>
        <Link to="/admin/memberships" className={styles.primaryBtn}>
          <FaIdCard /> Gérer les adhésions
        </Link>
      </div>

      {loading ? (
        <div className={styles.stateMsg}>Chargement des utilisateurs…</div>
      ) : members.length === 0 ? (
        <div className={styles.stateMsg}>Aucun utilisateur trouvé.</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Adhésion</th>
              </tr>
            </thead>
            <tbody>
              {members.map((u) => {
                const fullName =
                  [u.firstName, u.lastName].filter(Boolean).join(" ") ||
                  u.username ||
                  "—";
                const active = u.membership && u.membership.status === "active";
                return (
                  <tr key={u.id}>
                    <td className={styles.cellStrong}>{fullName}</td>
                    <td>{u.email}</td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          u.role === "admin" ? "" : styles.badgeMuted
                        }`}
                      >
                        {u.role === "admin" ? "Admin" : "Membre"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          active ? styles.badgeSuccess : styles.badgeMuted
                        }`}
                      >
                        {active ? "Active" : "Aucune"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
