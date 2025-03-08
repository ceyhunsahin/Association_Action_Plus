import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import styles from './ProfilePage.module.css';

import { FaCalendarAlt, FaSignOutAlt, FaEye, FaCalendarTimes, FaCalendarCheck, FaMapMarkerAlt, FaClock, FaSearch, FaPlus } from 'react-icons/fa';

const ProfilePage = () => {
  const { user, accessToken, logout } = useAuth();
  const [userEvents, setUserEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !accessToken) {
      navigate('/login');
      return;
    }

    fetchUserEvents();
  }, [user, accessToken, navigate]);

  const fetchUserEvents = async () => {
    if (!accessToken) return;
    
    try {
      setLoading(true);
      
      // Récupérer les événements pour les administrateurs et les utilisateurs normaux
      const response = await axios.get('http://localhost:8000/api/users/me/events', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      });
      
      console.log('User events response:', response.data);
      setUserEvents(response.data.events || []);
      setLoading(false);
      
    } catch (err) {
      console.error('Error in fetchUserEvents:', err);
      setError('Erreur lors du chargement des événements');
      setLoading(false);
    }
  };

  const handleUnregisterFromEvent = async (eventId, e) => {
    e.stopPropagation();
    
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
      await fetchUserEvents();
      setSuccessMessage('Vous vous êtes désinscrit avec succès!');
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
    } catch (err) {
      console.error('Error unregistering from event:', err.response?.data || err.message);
      setError(`Erreur lors de la désinscription: ${err.response?.data?.detail || err.message}`);
      
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  const handleViewEvent = (eventId, e) => {
    e.stopPropagation();
    navigate(`/events/${eventId}`);
  };

  const renderUserEvents = () => {
    if (!userEvents || userEvents.length === 0) {
        return (
            <div className={styles.noEventsContainer}>
                <div className={styles.noEventsIcon}>
                    <FaCalendarTimes />
                </div>
                <p className={styles.noEventsText}>Vous n'êtes inscrit à aucun événement pour le moment.</p>
                <div className={styles.eventButtons}>
                    <Link to="/events" className={styles.browseEventsButton}>
                        <FaSearch /> Découvrir les événements
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.userEventsContainer}>
            <div className={styles.userEventsHeader}>
                <h3 className={styles.userEventsTitle}>
                    <FaCalendarCheck /> Mes événements ({userEvents.length})
                </h3>
            </div>
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
                                    onClick={(e) => handleUnregisterFromEvent(event._id || event.id, e)}
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
      
      {error && (
        <div className={styles.errorMessage}>{error}</div>
      )}
      
      <div className={styles.profileHeader}>
        <h1 className={styles.profileTitle}>Mon Profil</h1>
      </div>
      
      <div className={styles.profileContent}>
        <div className={styles.eventsSection}>
          <h2 className={styles.sectionTitle}>Mes Événements</h2>
          {renderUserEvents()}
        </div>

        <div className={styles.profileActions}>
          <button className={styles.logoutButton} onClick={logout}>
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;