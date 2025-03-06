import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './ProfilePage.module.css';
import { FaCalendarAlt, FaSignOutAlt, FaEye } from 'react-icons/fa';

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
          
          {loading ? (
            <div className={styles.loading}>Chargement des événements...</div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : userEvents.length === 0 ? (
            <div className={styles.noEvents}>
              {user.role === 'admin' 
                ? 'Aucun événement n\'est disponible pour le moment.' 
                : 'Vous n\'êtes inscrit à aucun événement pour le moment.'}
            </div>
          ) : (
            <div className={styles.eventsGrid}>
              {userEvents.map(event => (
                <div key={event.id} className={styles.eventCard} onClick={() => navigate(`/events/${event.id}`)}>
                  <img 
                    src={event.image || "https://via.placeholder.com/300x200"} 
                    alt={event.title} 
                    className={styles.eventImage} 
                  />
                  <div className={styles.eventInfo}>
                    <h3 className={styles.eventTitle}>{event.title}</h3>
                    <p className={styles.eventDate}>
                      <FaCalendarAlt className={styles.eventIcon} /> {event.date}
                    </p>
                    <div className={styles.eventActions}>
                      <button 
                        className={styles.viewButton}
                        onClick={(e) => handleViewEvent(event.id, e)}
                      >
                        <FaEye /> Voir détails
                      </button>
                      {user.role !== 'admin' && (
                        <button 
                          className={styles.unregisterButton}
                          onClick={(e) => handleUnregisterFromEvent(event.id, e)}
                        >
                          <FaSignOutAlt /> Se désinscrire
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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