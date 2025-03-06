import React, { useState } from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaPaperPlane } from 'react-icons/fa';
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
  
  const handleSubmit = (e) => {
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
    
    // Burada gerçek bir API çağrısı yapılabilir
    // Şimdilik başarılı olduğunu varsayalım
    setFormStatus({
      submitted: true,
      error: false,
      message: 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.'
    });
    
    // Formu sıfırla
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
    
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
            <p>123 Rue de la Culture<br />75001 Paris, France</p>
          </div>
          
          <div className={styles.infoCard}>
            <div className={styles.iconWrapper}>
              <FaPhone />
            </div>
            <h3>Téléphone</h3>
            <p>+33 1 23 45 67 89</p>
            <p>+33 1 98 76 54 32</p>
          </div>
          
          <div className={styles.infoCard}>
            <div className={styles.iconWrapper}>
              <FaEnvelope />
            </div>
            <h3>Email</h3>
            <p>contact@association-culturelle.fr</p>
            <p>info@association-culturelle.fr</p>
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
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.9916256937595!2d2.292292615509614!3d48.85836507928746!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66e2964e34e2d%3A0x8ddca9ee380ef7e0!2sTour%20Eiffel!5e0!3m2!1sfr!2sfr!4v1621956217460!5m2!1sfr!2sfr"
          width="100%"
          height="450"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          title="Notre emplacement"
        ></iframe>
      </div>
    </div>
  );
};

export default Contact;