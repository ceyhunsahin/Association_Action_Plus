import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './HomePage.module.css';
import { Helmet } from 'react-helmet';
import { FaCalendarAlt, FaUsers, FaGlobeAmericas } from 'react-icons/fa';

const HomePage = () => {
  const [latestEvents, setLatestEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats] = useState({
    events: 120,
    members: 450,
    countries: 25
  });

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

  // Tarih formatını düzenleyen yardımcı fonksiyon
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  return (
    <>
      <Helmet>
        <title>Action Plus - Association Culturelle | Dialogue Interculturel</title>
        <meta name="description" content="Action Plus est une association culturelle qui promeut le dialogue interculturel, la diversité et l'inclusion sociale à travers des événements, ateliers et rencontres." />
        <meta name="keywords" content="association culturelle, dialogue interculturel, diversité, inclusion sociale" />
      </Helmet>
      
      <div className={styles.homepage}>
        {/* Hero Section */}
        <div
          className={styles.heroSection}
          style={{ 
            backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80')",
            backgroundColor: "rgba(0, 0, 0, 0.2)"
          }}
        >
          <div className={styles.heroContent}>
            <div className={styles.logoWrapper}>
              <img src="/logo.jpeg" alt="Action Plus Logo" className={styles.heroLogo} />
            </div>
            <h1 className={styles.heroTitle}>ACTION PLUS</h1>
            <p className={styles.heroSubtitle}>
              Promouvoir le dialogue interculturel, renforcer les liens sociaux et favoriser une société inclusive.
            </p>
            <div className={styles.heroButtons}>
              <Link
                to="/events"
                className={styles.heroButton}
              >
                Découvrir nos activités
              </Link>
              <Link
                to="/donation"
                className={styles.heroDonateButton}
              >
                Faire un don
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Section - Yeniden Tasarlandı */}
        <section className={styles.statsSection}>
          <div className={styles.statsContainer}>
            <div className={styles.statItem}>
              <div className={styles.statIcon}>
                <FaCalendarAlt />
              </div>
              <div className={styles.statNumber}>{stats.events}</div>
              <div className={styles.statLabel}>Événements organisés</div>
            </div>
            
            <div className={styles.statItem}>
              <div className={styles.statIcon}>
                <FaUsers />
              </div>
              <div className={styles.statNumber}>{stats.members}</div>
              <div className={styles.statLabel}>Membres actifs</div>
            </div>
            
            <div className={styles.statItem}>
              <div className={styles.statIcon}>
                <FaGlobeAmericas />
              </div>
              <div className={styles.statNumber}>{stats.countries}</div>
              <div className={styles.statLabel}>Pays représentés</div>
            </div>
          </div>
        </section>

        {/* Prochains Événements Section */}
        <section className={styles.eventsSection}>
          <h2 className={styles.sectionTitle}>Prochains Événements</h2>
          <div className={styles.sectionSubtitle}>Découvrez nos activités à venir</div>
          
          {loading ? (
            <div className={styles.loading}>Chargement des événements...</div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : (
            <div className={styles.eventCards}>
              {latestEvents.map(event => (
                <div key={event.id} className={styles.eventCard}>
                  <div 
                    className={styles.eventImage}
                    style={{ backgroundImage: `url(${event.image || 'https://via.placeholder.com/300x200?text=Action+Plus'})` }}
                  ></div>
                  <div className={styles.eventContent}>
                    <h3 className={styles.eventTitle}>{event.title}</h3>
                    <p className={styles.eventDescription}>{event.description.substring(0, 100)}...</p>
                    <div className={styles.eventMeta}>
                      <div className={styles.eventDate}>
                        <FaCalendarAlt />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <Link to={`/events/${event.id}`} className={styles.eventLink}>
                        En savoir plus
                      </Link>
                    </div>
                  </div>
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

        {/* Témoignages Section */}
        <section className={styles.testimonialsSection}>
          <h2 className={styles.sectionTitle}>Témoignages</h2>
          <div className={styles.sectionSubtitle}>Ce que disent nos membres</div>
          
          <div className={styles.testimonials}>
            <div className={styles.testimonialCard}>
              <div className={styles.testimonialQuote}>"</div>
              <div className={styles.testimonialContent}>
                <p>Action Plus m'a permis de découvrir de nouvelles cultures et de me faire des amis du monde entier. Les événements sont toujours enrichissants et bien organisés.</p>
              </div>
              <div className={styles.testimonialAuthor}>
                <img src="https://randomuser.me/api/portraits/women/65.jpg" alt="Sophie Martin" />
                <div>
                  <h4>Sophie Martin</h4>
                  <p>Membre depuis 2018</p>
                </div>
              </div>
            </div>
            
            <div className={styles.testimonialCard}>
              <div className={styles.testimonialQuote}>"</div>
              <div className={styles.testimonialContent}>
                <p>Grâce à Action Plus, j'ai pu partager ma culture et en apprendre davantage sur celles des autres. C'est une communauté vraiment accueillante et inclusive.</p>
              </div>
              <div className={styles.testimonialAuthor}>
                <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Ahmed Benali" />
                <div>
                  <h4>Ahmed Benali</h4>
                  <p>Membre depuis 2019</p>
                </div>
              </div>
            </div>
            
            <div className={styles.testimonialCard}>
              <div className={styles.testimonialQuote}>"</div>
              <div className={styles.testimonialContent}>
                <p>Les ateliers d'Action Plus sont non seulement éducatifs mais aussi très amusants. J'ai appris beaucoup sur différentes traditions et coutumes.</p>
              </div>
              <div className={styles.testimonialAuthor}>
                <img src="https://randomuser.me/api/portraits/women/45.jpg" alt="Maria Garcia" />
                <div>
                  <h4>Maria Garcia</h4>
                  <p>Membre depuis 2020</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Rejoignez-nous Section */}
        <section className={styles.joinSection}>
          <div className={styles.joinContent}>
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
          </div>
        </section>

        {/* Newsletter Section */}
        <section className={styles.newsletterSection}>
          <div className={styles.newsletterContent}>
            <h2 className={styles.newsletterTitle}>Restez informé</h2>
            <p className={styles.newsletterText}>
              Inscrivez-vous à notre newsletter pour recevoir les dernières nouvelles et mises à jour.
            </p>
            <form className={styles.newsletterForm}>
              <input type="email" placeholder="Votre adresse e-mail" required />
              <button type="submit">S'abonner</button>
            </form>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;