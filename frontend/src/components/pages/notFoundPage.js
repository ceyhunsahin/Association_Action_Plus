import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import styles from './NotFoundPage.module.css';

const NotFoundPage = () => {
  return (
    <>
      <Helmet>
        <title>Page non trouvée | Action Plus</title>
        <meta name="description" content="La page que vous recherchez n'existe pas." />
      </Helmet>
      
      <div className={styles.notFoundContainer}>
        <h1>404</h1>
        <h2>Page non trouvée</h2>
        <p>La page que vous recherchez n'existe pas ou a été déplacée.</p>
        <Link to="/" className={styles.homeButton}>
          Retour à l'accueil
        </Link>
      </div>
    </>
  );
};

export default NotFoundPage; 