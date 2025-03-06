import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import styles from './ProfilePage.module.css';

import { FaCalendarAlt, FaSignOutAlt, FaEye, FaCalendarTimes, FaCalendarCheck, FaMapMarkerAlt, FaClock, FaSearch } from 'react-icons/fa';

const ProfilePage = () => {
  const { user, accessToken, logout } = useAuth();
  const [userEvents, setUserEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
    if (!user || !accessToken) {
      navigate('/login');
      return;
    }

    fetchUserEvents();
  }, [user, accessToken, navigate]);

  // Kullanıcının etkinliklerini getir
  const fetchUserEvents = async () => {
    if (!accessToken) return;
    
    try {
      setLoading(true);
      
      // Admin kullanıcısı için tüm etkinlikleri getir
      if (user && user.role === 'admin') {
        try {
          const response = await axios.get('http://localhost:8000/api/events', {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            }
          });
          
          console.log('Admin events response:', response.data);
          setUserEvents(response.data || []);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching admin events:', error);
          setError('Erreur lors du chargement des événements');
          setLoading(false);
        }
        return;
      }
      
      // Normal kullanıcılar için kendi etkinliklerini getir
      try {
        const response = await axios.get('http://localhost:8000/api/users/me/events', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          }
        });
        
        console.log('User events response:', response.data);
        setUserEvents(response.data.events || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user events:', error);
        setError('Erreur lors du chargement des événements');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error in fetchUserEvents:', err);
      setError('Erreur lors du chargement des événements');
      setLoading(false);
    }
  };

  // Etkinlikten çıkma işlemi
  const handleUnregisterFromEvent = async (eventId, e) => {
    e.stopPropagation(); // Etkinlik kartına tıklamayı engelle
    
    if (!accessToken) return;
    
    try {
      console.log(`Attempting to unregister from event ${eventId}`);
      
      const response = await axios.delete(
        `http://localhost:8000/api/events/${eventId}/register`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      
      console.log('Unregister response:', response.data);
      
      // Etkinlik listesini güncelle
      await fetchUserEvents();
      
      setSuccessMessage('Désinscription réussie!');
    } catch (err) {
      console.error('Error unregistering from event:', err.response?.data || err.message);
      setError(`Erreur lors de la désinscription: ${err.response?.data?.detail || err.message}`);
    }
  };

  // Etkinlik detaylarına gitme
  const handleViewEvent = (eventId, e) => {
    e.stopPropagation(); // Etkinlik kartına tıklamayı engelle
    navigate(`/events/${eventId}`);
  };

  // Etkinlikten ayrılma işlemi
  const handleLeaveEvent = async (eventId) => {
    if (!user) return;

    try {
      console.log(`Attempting to leave event ${eventId}`);
      
      // Etkinlik ID'sini string'e çevir (eğer ObjectId ise)
      const eventIdStr = eventId.toString();
      
      // Backend'deki endpoint yapısına göre doğru metodu kullan
      // Endpoint'in beklediği metodu kullan (DELETE veya POST)
      const response = await axios.delete(
        `http://localhost:8000/api/events/${eventIdStr}/register`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      
      console.log('Leave event response:', response.data);
      
      // Kullanıcının etkinliklerini güncelle
      fetchUserEvents();
      
      // Başarı mesajı göster
      setSuccessMessage('Vous vous êtes désinscrit de cet événement avec succès!');
      
      // 3 saniye sonra mesajı kaldır
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Leave event error:', error.response || error);
      setError('Erreur lors de la désinscription à l\'événement. Veuillez réessayer.');
      
      // 3 saniye sonra hata mesajını kaldır
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  // Kullanıcının etkinliklerini göster
  const renderUserEvents = () => {
    if (!userEvents || userEvents.length === 0) {
        return (
            <div className={styles.noEventsContainer}>
                <div className={styles.noEventsIcon}>
                    <FaCalendarTimes />
                </div>
                <p className={styles.noEventsText}>Vous n'êtes inscrit à aucun événement pour le moment.</p>
                <Link to="/events" className={styles.browseEventsButton}>
                    <FaSearch /> Découvrir les événements
                </Link>
            </div>
        );
    }

    return (
        <div className={styles.userEventsContainer}>
            <h3 className={styles.userEventsTitle}>
                <FaCalendarCheck /> Mes événements ({userEvents.length})
            </h3>
            
            <div className={styles.userEventsList}>
                {userEvents.map(event => (
                    <div key={event._id || event.id} className={styles.userEventCard}>
                        <div className={styles.userEventImageContainer}>
                            <img 
                                src={event.image || 'https://via.placeholder.com/300x200?text=Événement'} 
                                alt={event.title} 
                                className={styles.userEventImage}
                            />
                            <div className={styles.userEventDate}>
                                <span className={styles.userEventDay}>
                                    {new Date(event.date).getDate()}
                                </span>
                                <span className={styles.userEventMonth}>
                                    {new Date(event.date).toLocaleDateString('fr-FR', { month: 'short' })}
                                </span>
                            </div>
                        </div>
                        
                        <div className={styles.userEventContent}>
                            <h4 className={styles.userEventTitle}>{event.title}</h4>
                            
                            <div className={styles.userEventDetails}>
                                <p className={styles.userEventLocation}>
                                    <FaMapMarkerAlt /> {event.location}
                                </p>
                                <p className={styles.userEventTime}>
                                    <FaClock /> {event.date}
                                </p>
                            </div>
                            
                            <div className={styles.userEventActions}>
                                <Link 
                                    to={`/events/${event._id || event.id}`} 
                                    className={styles.userEventViewButton}
                                >
                                    <FaEye /> Détails
                                </Link>
                                
                                <button 
                                    className={styles.userEventLeaveButton}
                                    onClick={() => handleLeaveEvent(event._id || event.id)}
                                >
                                    <FaSignOutAlt /> Se désinscrire
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
  };

  if (!user) {
    return <div className={styles.loading}>Redirection vers la page de connexion...</div>;
  }

  return (
    <div className={styles.profileContainer}>
      {successMessage && (
        <div className={styles.successMessage}>{successMessage}</div>
      )}
      
      <div className={styles.profileHeader}>
        <h1 className={styles.profileTitle}>
          {user.role === 'admin' ? 'Panneau d\'administration' : 'Mon Profil'}
        </h1>
      </div>
      
      <div className={styles.profileContent}>
        <div className={styles.eventsSection}>
          <h2 className={styles.sectionTitle}>
            {user.role === 'admin' ? 'Tous les Événements' : 'Mes Événements'}
          </h2>
          
          {renderUserEvents()}
        </div>

        <div className={styles.profileActions}>
          <button className={styles.logoutButton} onClick={logout}>
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;