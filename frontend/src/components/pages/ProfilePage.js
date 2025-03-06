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
      const response = await axios.get('http://localhost:8000/api/users/me/events', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      });
      
      setUserEvents(response.data.events || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user events:', err);
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
      
      alert('Désinscription réussie!');
    } catch (err) {
      console.error('Error unregistering from event:', err.response?.data || err.message);
      alert(`Erreur lors de la désinscription: ${err.response?.data?.detail || err.message}`);
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
      <div className={styles.profileHeader}>
        <div className={styles.profileAvatar}>
          {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
        </div>
        <h1 className={styles.profileName}>
          {user.firstName} {user.lastName}
        </h1>
        <p className={styles.profileEmail}>{user.email}</p>
        {user.role === 'admin' && (
          <span className={styles.adminBadge}>Administrateur</span>
        )}
      </div>

      <div className={styles.profileContent}>
        <div className={styles.profileSection}>
          <h2 className={styles.sectionTitle}>Informations personnelles</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Nom d'utilisateur:</span>
              <span className={styles.infoValue}>{user.username}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Email:</span>
              <span className={styles.infoValue}>{user.email}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Prénom:</span>
              <span className={styles.infoValue}>{user.firstName}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Nom:</span>
              <span className={styles.infoValue}>{user.lastName}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Rôle:</span>
              <span className={styles.infoValue}>{user.role === 'admin' ? 'Administrateur' : 'Membre'}</span>
            </div>
          </div>
        </div>

        <div className={styles.profileSection}>
          <h2 className={styles.sectionTitle}>Mes événements</h2>
          {loading ? (
            <p className={styles.loading}>Chargement des événements...</p>
          ) : error ? (
            <p className={styles.error}>{error}</p>
          ) : userEvents.length === 0 ? (
            <p className={styles.noEvents}>Vous n'avez pas encore rejoint d'événements.</p>
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
                      <button 
                        className={styles.unregisterButton}
                        onClick={(e) => handleUnregisterFromEvent(event.id, e)}
                      >
                        <FaSignOutAlt /> Se désinscrire
                      </button>
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