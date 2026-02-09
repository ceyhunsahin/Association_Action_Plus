import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaMapMarkerAlt, FaPhone, FaEnvelope, FaHeart } from 'react-icons/fa';
import styles from './Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={styles.footer}>
      <div className={styles.footerWave}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill="#5d4037" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
      
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <h3>Action Plus</h3>
          <p>Notre association vise à promouvoir le dialogue interculturel, la diversité et la solidarité à travers des actions éducatives, culturelles et sociales.</p>
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
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
        
        <div className={styles.footerSection}>
          <h3>Contactez-nous</h3>
          <address className={styles.contactInfo}>
            <p><FaMapMarkerAlt /> 13 Rte de Woippy, 57050 Metz, France</p>
            <p><FaPhone /> +33 3 87 56 75 00</p>
            <p><FaEnvelope /> contact@actionplusmetz.org</p>
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
          &copy; {currentYear} Action Plus. Tous droits réservés. | Numéro d'enregistrement: AA2025MET000109 | Site web: actionplusmetz.org
        </div>
        <div className={styles.footerBottomLinks}>
          <Link to="/confidentialite">Politique de confidentialité</Link>
          <Link to="/conditions">Conditions d'utilisation</Link>
          <Link to="/mentions-legales">Mentions légales</Link>
        </div>
      </div>
      
      <div className={styles.footerCredit}>
        <p>Créé avec <FaHeart className={styles.heartIcon} /> pour la communauté</p>
      </div>
    </footer>
  );
};

export default Footer; 
