import React from 'react';
import styles from './Contact.module.css';

const Contact = () => {
  return (
    <div className={styles.contactPage}>
      <div className={styles.contactContent}>
        <h1 className={styles.title}>Contactez-nous</h1>
        <p className={styles.subtitle}>
          Nous sommes à votre disposition pour répondre à vos questions et vous accompagner dans vos projets.
        </p>
        <div className={styles.contactInfo}>
          <div className={styles.infoItem}>
            <h2 className={styles.infoTitle}>Adresse</h2>
            <p className={styles.infoText}>
              123 Rue de la Culture, 75001 Paris, France
            </p>
          </div>
          <div className={styles.infoItem}>
            <h2 className={styles.infoTitle}>Téléphone</h2>
            <p className={styles.infoText}>
              +33 1 23 45 67 89
            </p>
          </div>
          <div className={styles.infoItem}>
            <h2 className={styles.infoTitle}>Email</h2>
            <p className={styles.infoText}>
              contact@actionplus.fr
            </p>
          </div>
        </div>
        <div className={styles.mapContainer}>
          <iframe
            title="Google Maps"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.99144060821!2d2.292292615674389!3d48.85837007928746!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66e2964e34e2d%3A0x8ddca9ee380ef7e0!2sTour%20Eiffel!5e0!3m2!1sen!2sfr!4v1633023226785!5m2!1sen!2sfr"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default Contact;