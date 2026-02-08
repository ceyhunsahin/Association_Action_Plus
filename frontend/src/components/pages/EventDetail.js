import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styles from './EventDetail.module.css';
import { useAuth } from '../../context/AuthContext';
import { FaCalendarAlt, FaUsers, FaChevronLeft, FaChevronRight, FaSignInAlt, FaSignOutAlt, FaArrowLeft, FaEdit, FaTrash } from 'react-icons/fa';

// Loader fonksiyonu
export async function loader({ params }) {
  try {
    const baseUrl = process.env.REACT_APP_API_BASE_URL || '';
    const response = await axios.get(`${baseUrl}/api/events/${params.id}`);
    return response.data;  // Backend'den gelen veriyi döndür
  } catch (error) {
    throw new Response("Event not found", { status: 404 });
  }
}

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();  // navigate'i kullanacağız
  const { user, accessToken, isAuthenticated, isAdmin } = useAuth();
  const baseUrl = process.env.REACT_APP_API_BASE_URL || '';
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const carouselRef = useRef(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Resim URL'sini düzgün formata çevir
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('/uploads/')) {
      return `${baseUrl}${imagePath}`;
    }
    return imagePath;
  };

  // Etkinlik medya listesini hazırla (image + video)
  const normalizeList = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const getEventMedia = useCallback(() => {
    const media = [];
    const images = normalizeList(event?.images);
    const videos = normalizeList(event?.videos);
    if (images.length > 0) {
      images.forEach(img => {
        const url = getImageUrl(img);
        if (url) media.push({ type: 'image', url });
      });
    } else if (event && event.image) {
      const url = getImageUrl(event.image);
      if (url) media.push({ type: 'image', url });
    }
    if (videos.length > 0) {
      videos.forEach(v => {
        const url = getImageUrl(v);
        if (url) media.push({ type: 'video', url });
      });
    }
    return media;
  }, [event]);

  const getEventVideos = useCallback(() => {
    const videos = normalizeList(event?.videos);
    if (videos.length > 0) {
      return videos.map(v => getImageUrl(v)).filter(Boolean);
    }
    return [];
  }, [event]);

  // Kullanıcının etkinliğe kayıtlı olup olmadığını kontrol et
  const checkRegistration = async () => {
    if (user && accessToken) {
      try {

        const response = await axios.get(
          `${baseUrl}/api/events/${id}/check-registration`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
        
        setIsRegistered(response.data.registered);
      } catch (err) {
        console.error('Error checking registration:', err);
      }
    }
  };

  // Etkinlik detaylarını yükle
  const fetchEventDetails = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/events/${id}`);
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
    try {
      setLoading(true);
      
      
      // Kullanıcı giriş yapmış mı kontrol et
      if (!user || !accessToken) {
        console.error('No user or access token available');
        setErrorMessage('Veuillez vous connecter pour vous inscrire à cet événement');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }
      
      // Token'ı kontrol et
      
      
      // localStorage'dan token'ı al
      const localToken = localStorage.getItem('accessToken') || accessToken;
      
      
      // Etkinliğe katıl - localStorage'dan token'ı kullan
      const response = await axios({
        method: 'post',
        url: `${baseUrl}/api/events/${id}/join`,
        headers: {
          'Authorization': `Bearer ${localToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      
      setIsRegistered(true);
      setSuccessMessage('Vous êtes inscrit à cet événement!');
      
      // Katılımcı sayısını güncelle
      setEvent(prev => ({
        ...prev,
        participant_count: (prev.participant_count || 0) + 1
      }));
      
      // Kayıt durumunu kontrol et
      await checkRegistration();
    } catch (error) {
      console.error('Error registering for event:', error);
      console.error('Error response:', error.response);
      
      if (error.response && error.response.status === 401) {
        setErrorMessage('Veuillez vous connecter pour vous inscrire à cet événement');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setErrorMessage(
          error.response?.data?.detail || 
          'Une erreur est survenue lors de l\'inscription à l\'événement'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUnregister = async () => {
    try {
      setLoading(true);
      
      
      const response = await axios.delete(
        `${baseUrl}/api/events/${id}/register`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      
      
      setIsRegistered(false);
      setSuccessMessage('Vous êtes désinscrit de cet événement!');
      
      // Katılımcı sayısını güncelle
      setEvent(prev => ({
        ...prev,
        participant_count: Math.max((prev.participant_count || 0) - 1, 0)
      }));
    } catch (error) {
      console.error('Error unregistering from event:', error);
      setErrorMessage(
        error.response?.data?.detail || 
        'Une erreur est survenue lors de la désinscription de l\'événement'
      );
    } finally {
      setLoading(false);
    }
  };

  // Carousel için önceki resme git
  const prevImage = useCallback(() => {
    const media = getEventMedia();
    if (media.length > 0) {
      setCurrentImageIndex((currentImageIndex - 1 + media.length) % media.length);
    }
  }, [currentImageIndex, getEventMedia]);

  // Carousel için sonraki resme git
  const nextImage = useCallback(() => {
    const media = getEventMedia();
    if (media.length > 0) {
      setCurrentImageIndex((currentImageIndex + 1) % media.length);
    }
  }, [currentImageIndex, getEventMedia]);

  // Carousel için görüntülenecek resimlerin indekslerini hesapla
  const getImageIndexes = useCallback(() => {
    const indexes = [];
    const totalImages = getEventMedia().length;
    
    if (totalImages === 0) return [];
    
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
  }, [currentImageIndex, getEventMedia]);

  // Etkinlikler sayfasına dönüş
  const handleBackToEvents = () => {
    navigate('/events');
  };

  const handleEditEvent = () => {
    navigate(`/events/edit/${id}`);
  };

  const handleDeleteEvent = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet événement?')) {
      try {
        await axios.delete(`${baseUrl}/api/events/${id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        alert('Événement supprimé avec succès!');
        navigate('/events');
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Une erreur s\'est produite lors de la suppression de l\'événement.');
      }
    }
  };

  if (loading) return <div className={styles.loading}>Chargement...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!event) return <div className={styles.error}>Événement non trouvé</div>;

  return (
    <div className={styles.eventDetailContainer}>
      <div className={styles.eventDetailHeader}>
        <Link to="/events" className={styles.backButton}>
          <FaArrowLeft /> Retour aux événements
        </Link>
        {isAdmin && (
          <div className={styles.adminActions}>
            <button 
              onClick={handleEditEvent}
              className={styles.editButton}
            >
              <FaEdit /> Modifier
            </button>
            <button 
              onClick={handleDeleteEvent}
              className={styles.deleteButton}
            >
              <FaTrash /> Supprimer
            </button>
          </div>
        )}
      </div>

      {getEventMedia().length > 0 && (
        <div className={styles.cinemaCarousel}>
          <button 
            className={`${styles.carouselButton} ${styles.prevButton}`}
            onClick={prevImage}
            aria-label="Image précédente"
          >
            <FaChevronLeft />
          </button>
          
          <div className={styles.carouselTrack} ref={carouselRef}>
            {getImageIndexes().map((imageIndex, i) => {
              const media = getEventMedia()[imageIndex];
              if (!media) return null;
              return (
              <div 
                key={`${imageIndex}-${i}`}
                className={`${styles.carouselSlide} ${
                  i === 2 ? styles.activeSlide : 
                  i < 2 ? styles.leftSlide : styles.rightSlide
                } ${
                  i === 1 || i === 3 ? styles.adjacentSlide : 
                  i === 0 || i === 4 ? styles.farSlide : ''
                }`}
              >
                {media.type === 'image' ? (
                  <img 
                    src={media.url} 
                    alt={`Vue de l'événement ${imageIndex + 1}`} 
                    className={styles.carouselImage}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <video 
                    src={media.url}
                    className={styles.carouselVideo}
                    controls
                    muted
                    playsInline
                    loop
                    autoPlay={i === 2}
                  />
                )}
              </div>
            )})}
          </div>
          
          <button 
            className={`${styles.carouselButton} ${styles.nextButton}`}
            onClick={nextImage}
            aria-label="Image suivante"
          >
            <FaChevronRight />
          </button>
        </div>
      )}

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

        {getEventVideos().length > 0 && (
          <div className={styles.eventVideos}>
            <h3 className={styles.sectionTitle}>Vidéos</h3>
            <div className={styles.videoGrid}>
              {getEventVideos().map((videoUrl, index) => (
                <video key={index} src={videoUrl} controls className={styles.videoItem} />
              ))}
            </div>
          </div>
        )}
        
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
