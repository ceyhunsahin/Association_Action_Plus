import React, { useState } from "react";
import { Helmet } from "react-helmet";
import {
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaPaperPlane,
  FaGlobe,
} from "react-icons/fa";
import styles from "./Contact.module.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [formStatus, setFormStatus] = useState({
    submitted: false,
    error: false,
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      setFormStatus({
        submitted: false,
        error: true,
        message: "Veuillez remplir tous les champs obligatoires.",
      });
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || window.location.origin}/api/contact`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message,
          }),
        },
      );

      if (response.ok) {
        const result = await response.json();
        setFormStatus({
          submitted: true,
          error: false,
          message:
            result.message ||
            "Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.",
        });
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        const errorData = await response.json();
        setFormStatus({
          submitted: false,
          error: true,
          message: errorData.detail || "Erreur lors de l'envoi du message.",
        });
      }
    } catch (error) {
      console.error("Contact form error:", error);
      setFormStatus({
        submitted: false,
        error: true,
        message: "Erreur lors de l'envoi du message. Veuillez réessayer.",
      });
    }

    setTimeout(() => {
      setFormStatus({ submitted: false, error: false, message: "" });
    }, 5000);
  };

  return (
    <div className={styles.contactContainer}>
      <Helmet>
        <title>Contact | Action Plus</title>
        <meta
          name="description"
          content="Contactez l'association Action Plus à Metz. Nous sommes à votre écoute pour toute question ou demande de partenariat."
        />
        <meta
          name="keywords"
          content="contact, Action Plus, Metz, adresse, téléphone, email"
        />
        <link rel="canonical" href="https://actionplusmetz.org/contact" />
      </Helmet>

      <div className={styles.contactHeader}>
        <h1>Contactez-nous</h1>
        <p>Nous sommes là pour répondre à toutes vos questions</p>
      </div>

      <div className={styles.infoStrip}>
        <div className={styles.infoChip}>
          <div className={styles.chipIcon}>
            <FaMapMarkerAlt />
          </div>
          <div>
            <span className={styles.chipLabel}>Adresse</span>
            <p className={styles.chipVal}>
              13 Rte de Woippy
              <br />
              57050 Metz, France
            </p>
          </div>
        </div>
        <div className={styles.infoChip}>
          <div className={styles.chipIcon}>
            <FaPhone />
          </div>
          <div>
            <span className={styles.chipLabel}>Téléphone</span>
            <p className={styles.chipVal}>+33 3 87 56 75 00</p>
          </div>
        </div>
        <div className={styles.infoChip}>
          <div className={styles.chipIcon}>
            <FaEnvelope />
          </div>
          <div>
            <span className={styles.chipLabel}>Email</span>
            <p className={styles.chipVal}>contact@actionplusmetz.org</p>
          </div>
        </div>
        <div className={styles.infoChip}>
          <div className={styles.chipIcon}>
            <FaGlobe />
          </div>
          <div>
            <span className={styles.chipLabel}>Site web</span>
            <p className={styles.chipVal}>actionplusmetz.org</p>
          </div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.contactForm}>
          <h2>Envoyez-nous un message</h2>

          {formStatus.message && (
            <div
              className={`${styles.formMessage} ${formStatus.error ? styles.error : styles.success}`}
            >
              {formStatus.message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className={styles.formRow}>
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

        <div className={styles.mapCard}>
          <div className={styles.mapCardHeader}>
            <h3>Notre emplacement</h3>
            <p>13 Route de Woippy, 57050 Metz, France</p>
          </div>
          <div className={styles.mapFrame}>
            <iframe
              src="https://www.google.com/maps?q=13+Rte+de+Woippy,+57050+Metz,+France&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0, display: "block" }}
              allowFullScreen=""
              loading="lazy"
              title="Action Plus - Notre emplacement à Metz"
            />
          </div>
          <div className={styles.hoursRow}>
            <div className={styles.hourItem}>
              <span className={styles.hourDay}>Lun – Ven</span>
              <span className={styles.hourTime}>9h00 – 18h00</span>
            </div>
            <div className={styles.hourItem}>
              <span className={styles.hourDay}>Samedi</span>
              <span className={styles.hourTime}>10h00 – 16h00</span>
            </div>
            <div className={styles.hourItem}>
              <span className={styles.hourDay}>Dimanche</span>
              <span className={`${styles.hourTime} ${styles.closed}`}>
                Fermé
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
