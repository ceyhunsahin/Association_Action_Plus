import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styles from './EventDetail.module.css';
import { useAuth } from '../../context/AuthContext';
import { FaCalendarAlt, FaUsers, FaChevronLeft, FaChevronRight, FaSignInAlt, FaSignOutAlt, FaArrowLeft } from 'react-icons/fa';

// Loader fonksiyonu
export async function loader({ params }) {
  try {
    const response = await axios.get(`http://localhost:8000/events/${params.id}`);
    return response.data;  // Backend'den gelen veriyi döndür
  } catch (error) {
    throw new Response("Event not found", { status: 404 });
  }
}

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();  // navigate'i kullanacağız
  const { user, accessToken } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const carouselRef = useRef(null);

  // Örnek resim galerisi - gerçek uygulamada bu verileri API'den alabilirsiniz
  const eventImages = [
    "https://picsum.photos/800/400?random=1",
    "https://picsum.photos/800/400?random=2",
    "https://picsum.photos/800/400?random=3",
    "https://picsum.photos/800/400?random=4",
    "https://picsum.photos/800/400?random=5",
  ];

  // Kullanıcının etkinliğe kayıtlı olup olmadığını kontrol et
  const checkRegistration = async () => {
    if (user && accessToken) {
      try {
        console.log("Checking registration for user:", user.id, "event:", id);
        const response = await axios.get(
          `http://localhost:8000/api/events/${id}/check-registration`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
        console.log("Registration check response:", response.data);
        setIsRegistered(response.data.registered);
      } catch (err) {
        console.error('Error checking registration:', err);
      }
    }
  };

  // Etkinlik detaylarını yükle
  const fetchEventDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/events/${id}`);
      setEvent(response.data);
      setLoading(false);
      
      // Kullanıcı giriş yapmışsa, kayıt durumunu kontrol et
      if (user && accessToken) {
        await checkRegistration();
      }
    } catch (err) {
      console.error('Error fetching event:', err);
      setError('Impossible de charger les détails de l\'événement');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [id, user, accessToken]);

  const handleRegister = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:8000/api/events/${id}/join`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Join event response:', response.data);
      setIsRegistered(true);
      // Etkinlik detaylarını yeniden yükle
      await fetchEventDetails();
      alert('Inscription réussie!');
    } catch (err) {
      console.error('Error registering for event:', err);
      alert('Erreur lors de l\'inscription');
    }
  };

  const handleUnregister = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:8000/api/events/${id}/register`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      console.log('Unregister response:', response.data);
      setIsRegistered(false);
      // Etkinlik detaylarını yeniden yükle
      await fetchEventDetails();
      alert('Désinscription réussie!');
    } catch (err) {
      console.error('Error unregistering from event:', err);
      alert('Erreur lors de la désinscription');
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === eventImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? eventImages.length - 1 : prevIndex - 1
    );
  };

  // Carousel'deki resimlerin indekslerini hesapla
  const getImageIndexes = () => {
    const indexes = [];
    const totalImages = eventImages.length;
    
    // Ortadaki resim (mevcut indeks)
    indexes.push(currentImageIndex);
    
    // Soldaki 2 resim
    for (let i = 1; i <= 2; i++) {
      const leftIndex = (currentImageIndex - i + totalImages) % totalImages;
      indexes.unshift(leftIndex);
    }
    
    // Sağdaki 2 resim
    for (let i = 1; i <= 2; i++) {
      const rightIndex = (currentImageIndex + i) % totalImages;
      indexes.push(rightIndex);
    }
    
    return indexes;
  };

  // Etkinlikler sayfasına dönüş
  const handleBackToEvents = () => {
    navigate('/events');
  };

  if (loading) return <div className={styles.loading}>Chargement...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!event) return <div className={styles.error}>Événement non trouvé</div>;

  return (
    <div className={styles.eventDetailContainer}>
      <div className={styles.cinemaCarousel}>
        <button 
          className={`${styles.carouselButton} ${styles.prevButton}`}
          onClick={prevImage}
          aria-label="Image précédente"
        >
          <FaChevronLeft />
        </button>
        
        <div className={styles.carouselTrack} ref={carouselRef}>
          {getImageIndexes().map((imageIndex, i) => (
            <div 
              key={imageIndex}
              className={`${styles.carouselSlide} ${
                i === 2 ? styles.activeSlide : 
                i < 2 ? styles.leftSlide : styles.rightSlide
              } ${
                i === 1 || i === 3 ? styles.adjacentSlide : 
                i === 0 || i === 4 ? styles.farSlide : ''
              }`}
            >
              <img 
                src={eventImages[imageIndex]} 
                alt={`Vue de l'événement ${imageIndex + 1}`} 
                className={styles.carouselImage}
              />
            </div>
          ))}
        </div>
        
        <button 
          className={`${styles.carouselButton} ${styles.nextButton}`}
          onClick={nextImage}
          aria-label="Image suivante"
        >
          <FaChevronRight />
        </button>
      </div>

      <div className={styles.eventContent}>
        <h1 className={styles.eventTitle}>{event.title}</h1>
        
        <div className={styles.eventMeta}>
          <div className={styles.metaItem}>
            <FaCalendarAlt className={styles.metaIcon} />
            <span>{event.date}</span>
          </div>
          <div className={styles.metaItem}>
            <FaUsers className={styles.metaIcon} />
            <span>{event.participant_count || 0} participants</span>
          </div>
        </div>
        
        <div className={styles.eventDescription}>
          <p>{event.description}</p>
        </div>
        
        <div className={styles.eventActions}>
          {user ? (
            isRegistered ? (
              <button 
                onClick={handleUnregister}
                className={styles.unregisterButton}
              >
                <FaSignOutAlt /> Se désinscrire
              </button>
            ) : (
              <button 
                onClick={handleRegister}
                className={styles.registerButton}
              >
                <FaSignInAlt /> S'inscrire
              </button>
            )
          ) : (
            <Link to="/login" className={styles.loginButton}>
              <FaSignInAlt /> Connectez-vous pour vous inscrire
            </Link>
          )}
          
          <button 
            onClick={handleBackToEvents} 
            className={styles.backButton}
          >
            <FaArrowLeft /> Retour aux événements
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;