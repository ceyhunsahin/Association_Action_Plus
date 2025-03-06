import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import styles from './Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <h3>Association Culturelle</h3>
          <p>Notre association culturelle est dédiée à la promotion et à la préservation de la culture et des traditions.</p>
          <div className={styles.socialIcons}>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FaFacebook />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <FaTwitter />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <FaLinkedin />
            </a>
          </div>
        </div>
        
        <div className={styles.footerSection}>
          <h3>Plan du site</h3>
          <ul className={styles.footerLinks}>
            <li><Link to="/">Accueil</Link></li>
            <li><Link to="/about">À propos</Link></li>
            <li><Link to="/events">Événements</Link></li>
            <li><Link to="/donate">Faire un don</Link></li>
            <li><Link to="/login">Connexion</Link></li>
            <li><Link to="/register">Inscription</Link></li>
          </ul>
        </div>
        
        <div className={styles.footerSection}>
          <h3>Contactez-nous</h3>
          <address className={styles.contactInfo}>
            <p><FaMapMarkerAlt /> 123 Rue de la Culture, 75001 Paris, France</p>
            <p><FaPhone /> +33 1 23 45 67 89</p>
            <p><FaEnvelope /> contact@association-culturelle.fr</p>
          </address>
        </div>
        
        <div className={styles.footerSection}>
          <h3>Heures d'ouverture</h3>
          <ul className={styles.openingHours}>
            <li><span>Lundi - Vendredi:</span> 9h00 - 18h00</li>
            <li><span>Samedi:</span> 10h00 - 16h00</li>
            <li><span>Dimanche:</span> Fermé</li>
          </ul>
        </div>
      </div>
      
      <div className={styles.footerBottom}>
        <div className={styles.copyright}>
          &copy; {currentYear} Association Culturelle. Tous droits réservés.
        </div>
        <div className={styles.footerBottomLinks}>
          <Link to="/privacy-policy">Politique de confidentialité</Link>
          <Link to="/terms-of-service">Conditions d'utilisation</Link>
          <Link to="/sitemap">Plan du site</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 