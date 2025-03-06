import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerLogo}>
          <img src="/logo.jpeg" alt="Action Plus Logo" className={styles.footerLogoImage} />
          <h3 className={styles.footerTitle}>ACTION PLUS</h3>
          <p className={styles.footerTagline}>Association Culturelle</p>
        </div>
        
        <div className={styles.footerLinks}>
          <h4>Liens Rapides</h4>
          <ul>
            <li><Link to="/">Accueil</Link></li>
            <li><Link to="/about">À propos</Link></li>
            <li><Link to="/events">Événements</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
        
        <div className={styles.footerContact}>
          <h4>Contact</h4>
          <p><i className="fas fa-map-marker-alt"></i> 123 Rue de Paris, 75001 Paris</p>
          <p><i className="fas fa-phone"></i> +33 1 23 45 67 89</p>
          <p><i className="fas fa-envelope"></i> contact@actionplus.org</p>
        </div>
      </div>
      
      <div className={styles.footerBottom}>
        <p>&copy; {new Date().getFullYear()} ACTION PLUS. Tous droits réservés.</p>
      </div>
    </footer>
  );
};

export default Footer; 