import React from 'react';
import styles from './NosActivities.module.css';

const NosActivites = () => {
  return (
    <div className={styles.activitesContainer}>
      <h2 className={styles.activitesTitle}>Nos Activités</h2>
      <div className={styles.activitesGrid}>
        <div className={styles.activityCard}>
          <h3>Ateliers culturels</h3>
          <p>
            Découvrez et partagez les savoirs et les traditions à travers des ateliers intergénérationnels.
          </p>
        </div>
        <div className={styles.activityCard}>
          <h3>Événements conviviaux</h3>
          <p>
            Rencontrez-vous autour de dîners, de conférences et de moments de partage pour renforcer les liens sociaux.
          </p>
        </div>
        <div className={styles.activityCard}>
          <h3>Projets éducatifs</h3>
          <p>
            Sensibilisez-vous aux valeurs de tolérance, de citoyenneté et de vivre-ensemble.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NosActivites;