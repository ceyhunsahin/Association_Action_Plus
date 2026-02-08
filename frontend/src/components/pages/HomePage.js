import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './HomePage.module.css';
import { Helmet } from 'react-helmet';
import { FaCalendarAlt, FaUsers, FaGlobeAmericas, FaMapMarkerAlt, FaArrowRight, FaHandHoldingHeart, FaTicketAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const [latestEvents, setLatestEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const baseUrl = process.env.REACT_APP_API_BASE_URL || '';
  const [stats, setStats] = useState({
    events: 0,
    members: 0,
    visitors: 0
  });

  // Scroll refs
  const statsScrollRef = useRef(null);
  const eventsScrollRef = useRef(null);
  const testimonialsScrollRef = useRef(null);

  // Scroll functions - Card'ları tam görünür yap
  const scrollLeft = (ref) => {
    if (ref.current) {
      const container = ref.current;
      const cards = container.children;
      const cardCount = cards.length;
      
      if (cardCount <= 1) return;
      
      const isMobile = window.innerWidth <= 390;
      const cardWidth = isMobile ? 180 : 180; // Stats card genişliği
      const gap = isMobile ? 24 : 24; // Gap değeri
      const totalCardWidth = cardWidth + gap;
      
      // Mevcut scroll pozisyonu
      const currentScroll = container.scrollLeft;
      
      // Hangi card'dayız?
      const currentCardIndex = Math.floor(currentScroll / totalCardWidth);
      
      // Bir önceki card'a git
      const newCardIndex = Math.max(0, currentCardIndex - 1);
      const newScroll = newCardIndex * totalCardWidth;
      
      container.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = (ref) => {
    if (ref.current) {
      const container = ref.current;
      const cards = container.children;
      const cardCount = cards.length;
      
      if (cardCount <= 1) return;
      
      const isMobile = window.innerWidth <= 390;
      const cardWidth = isMobile ? 180 : 180; // Stats card genişliği
      const gap = isMobile ? 24 : 24; // Gap değeri
      const totalCardWidth = cardWidth + gap;
      
      // Mevcut scroll pozisyonu
      const currentScroll = container.scrollLeft;
      
      // Hangi card'dayız?
      const currentCardIndex = Math.floor(currentScroll / totalCardWidth);
      
      // Bir sonraki card'a git
      const newCardIndex = Math.min(cardCount - 1, currentCardIndex + 1);
      const newScroll = newCardIndex * totalCardWidth;
      
      container.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const fetchLatestEvents = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/events`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcoming = response.data
          .filter(event => {
            const eventDate = new Date(event.date);
            if (Number.isNaN(eventDate.getTime())) return false;
            eventDate.setHours(0, 0, 0, 0);
            return eventDate >= today;
          })
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 3);
        // Yaklaşan 3 etkinliği al
        const latest = upcoming;
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

  useEffect(() => {
    const trackAndFetchStats = async () => {
      try {
        await axios.post(`${baseUrl}/api/visits/track`);
      } catch {
        // ignore tracking errors
      }

      try {
        const response = await axios.get(`${baseUrl}/api/stats`);
        if (response?.data) {
          setStats({
            events: response.data.events ?? 0,
            members: response.data.members ?? 0,
            visitors: response.data.visitors ?? 0
          });
        }
      } catch {
        // ignore stats errors
      }
    };

    trackAndFetchStats();
  }, []);

  // Tarih formatını düzenleyen yardımcı fonksiyon
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('/uploads/')) {
      return `${baseUrl}${imagePath}`;
    }
    return imagePath;
  };

  const getVideos = (event) => {
    if (!event?.videos) return [];
    if (Array.isArray(event.videos)) return event.videos;
    try {
      const parsed = JSON.parse(event.videos);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  return (
    <>
      <Helmet>
        <title>Action Plus - Association Culturelle | Dialogue Interculturel</title>
        <meta name="description" content="Action Plus est une association qui promeut le dialogue interculturel, la diversité et la solidarité à travers des actions éducatives, culturelles et sociales." />
        <meta name="keywords" content="association culturelle, dialogue interculturel, diversité, inclusion sociale" />
      </Helmet>
      
      <div className={styles.homepage}>
        {/* Hero Section - Yeniden Tasarlandı */}
        <div className={styles.heroSection}>
          <div className={styles.heroBackground}>
            <div className={styles.heroBackgroundOverlay}></div>
            <div className={styles.heroBackgroundImage}></div>
            <div className={styles.heroParticles}>
              {Array(20).fill().map((_, i) => (
                <div key={i} className={styles.particle}></div>
              ))}
            </div>
          </div>
          
          <div className={styles.heroContentWrapper}>
            <div className={styles.heroContent}>
              <div className={styles.heroLogoContainer}>
                <img 
                  src="logo.svg" 
                  alt="Action Plus Logo" 
                  className={styles.heroLogo} 
                />
                <div className={styles.logoGlow}></div>
              </div>
              
              <h1 className={styles.heroTitle}>
                <span className={styles.titleFirstLetter}>A</span>CTION 
                <span className={styles.titleSpacer}></span>
                <span className={styles.titleFirstLetter}>P</span>LUS
              </h1>
              
              <div className={styles.heroTaglineContainer}>
                <p className={styles.heroTagline}>
                  <span className={styles.taglineWord}>Dialogue</span>
                  <span className={styles.taglineWord}>Diversité</span>
                  <span className={styles.taglineWord}>Inclusion</span>
                </p>
              </div>
              
              <p className={styles.heroDescription}>
                <span className={styles.descriptionPhrase}>Promouvoir le dialogue interculturel</span>
                <span className={styles.descriptionDivider}></span>
                <span className={styles.descriptionPhrase}>Renforcer les liens entre les générations</span>
                <span className={styles.descriptionDivider}></span>
                <span className={styles.descriptionPhrase}>Encourager la tolérance et la citoyenneté</span>
              </p>
            </div>
            
            <div className={styles.heroButtonsContainer}>
              <Link to="/events" className={styles.primaryButton}>
                <span className={styles.buttonText}>Découvrir nos activités</span>
                <span className={styles.buttonIcon}>→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Section - Yeniden Tasarlandı */}
        <section className={styles.statsSection}>
          <div className={styles.statsContainer} ref={statsScrollRef}>
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
              <div className={styles.statLabel}>Visiteurs uniques</div>
            </div>
          </div>
          
          <div className={styles.scrollButtons}>
            <button 
              className={styles.scrollButton} 
              onClick={() => scrollLeft(statsScrollRef)}
              aria-label="Scroll left"
            >
              <FaChevronLeft />
            </button>
            <button 
              className={styles.scrollButton} 
              onClick={() => scrollRight(statsScrollRef)}
              aria-label="Scroll right"
            >
              <FaChevronRight />
            </button>
          </div>
        </section>

        {/* Prochains Événements Section */}
        <section className={styles.eventsSection}>
          <div className={styles.eventsSectionHeader}>
            <h2 className={styles.sectionTitle}>Prochains Événements</h2>
            <div className={styles.sectionSubtitle}>Découvrez nos activités à venir</div>
          </div>
          
          {loading ? (
            <div className={styles.loading}>Chargement des événements...</div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : latestEvents.length === 0 ? (
            <div className={styles.empty}>Aucune activité à venir pour le moment.</div>
          ) : (
            <div className={styles.eventsContainer}>
              <div className={styles.eventCards} ref={eventsScrollRef}>
                {latestEvents.map(event => (
                  <div key={event.id} className={styles.eventCard}>
                    <div className={styles.eventCardImageContainer}>
                      <img 
                        src={getImageUrl(event.image) || '/assets/default-image.jpg'} 
                        alt={event.title}
                        className={styles.eventCardImage}
                      />
                      {getVideos(event).length > 0 && (
                        <div className={styles.videoBadge}>
                          Video: {getVideos(event).length}
                        </div>
                      )}
                      <div className={styles.eventCardDate}>
                        <FaCalendarAlt />
                        <span>{formatDate(event.date)}</span>
                      </div>
                    </div>
                    <div className={styles.eventCardContent}>
                      <span className={styles.eventCardCategory}>Événement culturel</span>
                      <h3 className={styles.eventCardTitle}>{event.title}</h3>
                      <p className={styles.eventCardDescription}>
                        {event.description.substring(0, 100)}...
                      </p>
                      <div className={styles.eventCardFooter}>
                        <div className={styles.eventCardLocation}>
                          <FaMapMarkerAlt />
                          <span>{event.location || 'Paris'}</span>
                        </div>
                        <Link to={`/events/${event.id}`} className={styles.eventCardButton}>
                          En savoir plus
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className={styles.scrollButtons}>
                <button 
                  className={styles.scrollButton} 
                  onClick={() => scrollLeft(eventsScrollRef)}
                  aria-label="Scroll left"
                >
                  <FaChevronLeft />
                </button>
                <button 
                  className={styles.scrollButton} 
                  onClick={() => scrollRight(eventsScrollRef)}
                  aria-label="Scroll right"
                >
                  <FaChevronRight />
                </button>
              </div>
              
              <Link to="/events" className={styles.viewAllEventsButton}>
                Voir tous les événements
                <FaArrowRight />
              </Link>
            </div>
          )}
        </section>

        {/* Témoignages Section */}
        <section className={styles.testimonialsSection}>
          <h2 className={styles.sectionTitle}>Témoignages</h2>
          <div className={styles.sectionSubtitle}>Ce que disent nos membres</div>
          
          <div className={styles.testimonials} ref={testimonialsScrollRef}>
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
          
          <div className={styles.scrollButtons}>
            <button 
              className={styles.scrollButton} 
              onClick={() => scrollLeft(testimonialsScrollRef)}
              aria-label="Scroll left"
            >
              <FaChevronLeft />
            </button>
            <button 
              className={styles.scrollButton} 
              onClick={() => scrollRight(testimonialsScrollRef)}
              aria-label="Scroll right"
            >
              <FaChevronRight />
            </button>
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
      </div>
    </>
  );
};

export default HomePage;
