// src/components/Breadcrumbs/ReturnPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { extractParamsFromStringAsList } from '../../util';
import { useId } from 'react';
import styles from './ReturnPage.module.css';

export const ReturnPage = (s) => {
  const keyId = useId();
  const searchData = extractParamsFromStringAsList(s);

  return (
    <div className={styles.breadcrumbs}>
      <Link to="/" className={styles.link}>
        <span className={styles.icon}>🏠</span>
        Accueil
      </Link>
      <span className={styles.separator}>›</span>
      <Link to="/events" className={styles.link}>
        {searchData[0] !== undefined ? searchData.join('&') : 'Événements'}
      </Link>
      <span className={styles.separator}>›</span>
      <span className={styles.text}>Détails de l'événement</span>
    </div>
  );
};