// src/components/Footer/Footer.js
import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {

  const currentYear = new Date().getFullYear();


  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <p className={styles.text}>
          © {currentYear} Action Plus. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
};

export default Footer;