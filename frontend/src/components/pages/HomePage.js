import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './HomePage.module.css';

const HomePage = () => {
  const [latestEvents, setLatestEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLatestEvents = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/events');
        // Son 3 etkinliği al
        const latest = response.data.slice(0, 3);
        setLatestEvents(latest);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching latest events:', err);
        setError('Erreur lors du chargement des événements');
        setLoading(false);
      }
    };

    fetchLatestEvents();
  }, []);

  return (
    <div className={styles.homepage}>
      {/* Hero Section */}
      <div
        className={styles.heroSection}
        style={{ backgroundImage: "url('https://picsum.photos/1280/720')" }}
      >
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>ACTION PLUS</h1>
          <p className={styles.heroSubtitle}>
            Promouvoir le dialogue interculturel, renforcer les liens sociaux et favoriser une société inclusive.
          </p>
          <Link
            to="/events"
            className={styles.heroButton}
          >
            Découvrir nos activités
          </Link>
        </div>
      </div>

      {/* Derniers événements */}
      <section className={styles.eventsSection}>
        <h2 className={styles.sectionTitle}>Nos derniers événements</h2>
        {loading ? (
          <p className={styles.loading}>Chargement des événements...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : (
          <div className={styles.eventsGrid}>
            {latestEvents.map((event) => (
              <div key={event.id} className={styles.eventCard}>
                <Link to={`/events/${event.id}`}>
                  <img
                    src={event.image || 'https://via.placeholder.com/300x200'}
                    alt={event.title}
                    className={styles.eventImage}
                  />
                  <div className={styles.eventContent}>
                    <h3 className={styles.eventTitle}>{event.title}</h3>
                    <p className={styles.eventDate}>{event.date}</p>
                    <p className={styles.eventDescription}>
                      {event.description.length > 100 
                        ? `${event.description.substring(0, 100)}...` 
                        : event.description}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
        <div className={styles.viewAllContainer}>
          <Link to="/events" className={styles.viewAllButton}>
            Voir tous les événements
          </Link>
        </div>
      </section>

      {/* À propos de nous */}
      <section className={styles.aboutSection}>
        <div className={styles.aboutContent}>
          <h2 className={styles.sectionTitle}>Qui sommes-nous ?</h2>
          <p className={styles.aboutText}>
            ACTION PLUS est une association à but non lucratif qui œuvre pour favoriser le dialogue interculturel, 
            promouvoir la diversité culturelle et renforcer la cohésion sociale. Fondée en 2010, notre association 
            organise régulièrement des événements culturels, des ateliers et des rencontres pour créer des espaces 
            d'échange et de partage entre les différentes communautés.
          </p>
          <p className={styles.aboutText}>
            Notre mission est de construire des ponts entre les cultures, de lutter contre les préjugés et 
            de contribuer à une société plus inclusive et solidaire. Nous croyons fermement que la diversité 
            est une richesse et que le dialogue interculturel est essentiel pour vivre ensemble harmonieusement.
          </p>
          <Link to="/about" className={styles.aboutButton}>
            En savoir plus
          </Link>
        </div>
        <div className={styles.aboutImageContainer}>
          <img 
            src="https://picsum.photos/600/400" 
            alt="Notre association" 
            className={styles.aboutImage} 
          />
        </div>
      </section>

      {/* Rejoignez-nous */}
      <section className={styles.joinSection}>
        <h2 className={styles.joinTitle}>Rejoignez notre communauté</h2>
        <p className={styles.joinText}>
          Devenez membre de notre association et participez à nos événements culturels.
        </p>
        <div className={styles.joinButtons}>
          <Link to="/register" className={styles.registerButton}>
            S'inscrire
          </Link>
          <Link to="/login" className={styles.loginButton}>
            Se connecter
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;