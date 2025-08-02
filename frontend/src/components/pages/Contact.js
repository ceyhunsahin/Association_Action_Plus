import React, { useState } from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaPaperPlane, FaGlobe } from 'react-icons/fa';
import styles from './Contact.module.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    error: false,
    message: ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form doğrulama
    if (!formData.name || !formData.email || !formData.message) {
      setFormStatus({
        submitted: false,
        error: true,
        message: 'Veuillez remplir tous les champs obligatoires.'
      });
      return;
    }
    
    try {
      const response = await fetch('http://localhost:8000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        setFormStatus({
          submitted: true,
          error: false,
          message: result.message || 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.'
        });
        
        // Formu sıfırla
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        const errorData = await response.json();
        setFormStatus({
          submitted: false,
          error: true,
          message: errorData.detail || 'Erreur lors de l\'envoi du message.'
        });
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setFormStatus({
        submitted: false,
        error: true,
        message: 'Erreur lors de l\'envoi du message. Veuillez réessayer.'
      });
    }
    
    // 5 saniye sonra mesajı temizle
    setTimeout(() => {
      setFormStatus({
        submitted: false,
        error: false,
        message: ''
      });
    }, 5000);
  };
  
  return (
    <div className={styles.contactContainer}>
      <div className={styles.contactHeader}>
        <h1>Contactez-nous</h1>
        <p>Nous sommes là pour répondre à toutes vos questions</p>
      </div>
      
      <div className={styles.contactContent}>
        <div className={styles.contactInfo}>
          <div className={styles.infoCard}>
            <div className={styles.iconWrapper}>
              <FaMapMarkerAlt />
            </div>
            <h3>Notre adresse</h3>
            <p>3A rue des Jardiniers<br />57000 METZ, France</p>
          </div>
          
          <div className={styles.infoCard}>
            <div className={styles.iconWrapper}>
              <FaPhone />
            </div>
            <h3>Téléphone</h3>
            <p>+33 3 87 56 75 00</p>
            <p>Action Plus</p>
          </div>
          
          <div className={styles.infoCard}>
            <div className={styles.iconWrapper}>
              <FaEnvelope />
            </div>
            <h3>Email</h3>
            <p>contact@actionplusmetz.org</p>
            <p>Action Plus</p>
          </div>
          
          <div className={styles.infoCard}>
            <div className={styles.iconWrapper}>
              <FaGlobe />
            </div>
            <h3>Site web</h3>
            <p>actionplusmetz.org</p>
            <p>Action Plus</p>
          </div>
          
          <div className={styles.infoCard}>
            <div className={styles.iconWrapper}>
              <FaClock />
            </div>
            <h3>Heures d'ouverture</h3>
            <p>Lundi - Vendredi: 9h00 - 18h00</p>
            <p>Samedi: 10h00 - 16h00</p>
            <p>Dimanche: Fermé</p>
          </div>
        </div>
        
        <div className={styles.contactForm}>
          <h2>Envoyez-nous un message</h2>
          
          {formStatus.message && (
            <div className={`${styles.formMessage} ${formStatus.error ? styles.error : styles.success}`}>
              {formStatus.message}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Nom complet *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Votre nom"
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Votre email"
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="subject">Sujet</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Sujet de votre message"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Votre message"
                rows="5"
                required
              ></textarea>
            </div>
            
            <button type="submit" className={styles.submitButton}>
              <FaPaperPlane /> Envoyer le message
            </button>
          </form>
        </div>
      </div>
      
      <div className={styles.mapContainer}>
        <iframe
          src="https://www.google.com/maps?q=3A+rue+des+Jardiniers,+57000+Metz,+France&output=embed"
          width="100%"
          height="450"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          title="Action Plus - Notre emplacement à Metz"
        />
      </div>
    </div>
  );
};

export default Contact;