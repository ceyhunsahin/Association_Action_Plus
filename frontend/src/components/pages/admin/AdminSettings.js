import React from "react";
import { useAuth } from "../../../context/AuthContext";
import styles from "./AdminPages.module.css";

const AdminSettings = () => {
  const { user } = useAuth();

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Paramètres</h1>
          <p className={styles.pageSubtitle}>
            Informations du compte administrateur.
          </p>
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Compte</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <tbody>
              <tr>
                <td className={styles.cellStrong}>Nom</td>
                <td>
                  {[user?.firstName, user?.lastName]
                    .filter(Boolean)
                    .join(" ") || "—"}
                </td>
              </tr>
              <tr>
                <td className={styles.cellStrong}>Email</td>
                <td>{user?.email || "—"}</td>
              </tr>
              <tr>
                <td className={styles.cellStrong}>Nom d'utilisateur</td>
                <td>{user?.username || "—"}</td>
              </tr>
              <tr>
                <td className={styles.cellStrong}>Rôle</td>
                <td>
                  <span className={styles.badge}>{user?.role || "admin"}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>À propos</h2>
        <p className={styles.pageSubtitle}>
          Panneau d'administration Action+. D'autres paramètres pourront être
          ajoutés ici ultérieurement.
        </p>
      </div>
    </div>
  );
};

export default AdminSettings;
