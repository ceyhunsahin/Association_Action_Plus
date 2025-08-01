import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaCalendarAlt, FaEdit, FaHandHoldingHeart, FaEye, FaSearch, 
  FaCalendarCheck, FaSignOutAlt, FaMapMarkerAlt, FaClock, FaHeart, FaTrophy, FaMedal,
  FaCheckCircle, FaExclamationCircle, FaCalendarDay, FaCalendarWeek, FaRegCalendarAlt, 
  FaHistory, FaTools, FaMusic, FaPalette, FaMicrophone, FaTheaterMasks, FaChartLine,
  FaBirthdayCake, FaStar, FaGem, FaAward, FaCrown, FaUserFriends, FaBookmark } from 'react-icons/fa';
import styles from './ProfilePage.module.css';



const ProfilePage = () => {
  const { user, accessToken, logout, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, events, settings
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    profileImage: ''
  });

  const [userEvents, setUserEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [animateProfile, setAnimateProfile] = useState(false);

  const profileRef = useRef(null);
  const navigate = useNavigate();

  // Sayfa yüklendiğinde animasyon efekti
  useEffect(() => {
    setAnimateProfile(true);
    const timer = setTimeout(() => setAnimateProfile(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!user || !accessToken) {
      navigate('/login');
      return;
    }

    // Form verilerini kullanıcı bilgileriyle doldur
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        profileImage: user.profileImage || ''
      });
    }

    // Kullanıcının etkinliklerini getir
    fetchUserEvents();
  }, [user, accessToken, navigate]);



  // Kullanıcının etkinliklerini getir
  const fetchUserEvents = async () => {
    if (!accessToken) return;
    
    try {
      setLoading(true);
      
      // Doğrudan tüm etkinlikleri getir ve kullanıcının katıldıklarını işaretle
      const allEventsResponse = await axios.get('https://association-action-plus.onrender.com/api/events');
      console.log('All events response:', allEventsResponse.data);
      
      // Tüm etkinlikleri al
      const allEvents = Array.isArray(allEventsResponse.data) ? allEventsResponse.data : 
                       (allEventsResponse.data && Array.isArray(allEventsResponse.data.events)) ? allEventsResponse.data.events : [];
      
      // Kullanıcının katıldığı etkinlikleri kontrol et
      try {
        const userEventsResponse = await axios.get('https://association-action-plus.onrender.com/api/users/me/events', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        console.log('User events response:', userEventsResponse.data);
        
        // Kullanıcının katıldığı etkinliklerin ID'lerini al
        const userEventIds = userEventsResponse.data.events ? 
                            userEventsResponse.data.events.map(event => event.id) : [];
        
        // Tüm etkinlikleri işaretle
        const markedEvents = allEvents.map(event => ({
          ...event,
          isParticipating: userEventIds.includes(event.id)
        }));
        
        // Kullanıcının katıldığı etkinlikleri filtrele
        const participatingEvents = markedEvents.filter(event => event.isParticipating);
        
        // Eğer kullanıcının katıldığı etkinlik yoksa, tüm etkinlikleri göster
        setUserEvents(participatingEvents.length > 0 ? participatingEvents : markedEvents.slice(0, 5));
      } catch (error) {
        console.error('Error fetching user events:', error);
        // Hata durumunda tüm etkinlikleri göster
        setUserEvents(allEvents.slice(0, 5));
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error in fetchUserEvents:', err);
      setError('Nous n\'avons pas pu récupérer vos événements pour le moment.');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUserProfile(formData);
      setIsEditing(false);
      setSuccessMessage('Votre profil a été mis à jour avec succès!');
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Profil güncellenirken hata oluştu:', error);
      setError('Une erreur est survenue lors de la mise à jour de votre profil.');
      
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  const handleViewEvent = (eventId) => {
    navigate(`/events/${eventId}`);
  };





  // Kullanıcının üyelik süresini hesapla
  const calculateMembershipDuration = () => {
   if (!user || !user.created_at) return '0 jour';
    
    const createdDate = new Date(user.created_at);
    const today = new Date();
    const diffTime = Math.abs(today - createdDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} mois`;
    }
    
    const years = Math.floor(diffDays / 365);
    const remainingMonths = Math.floor((diffDays % 365) / 30);
    
    if (remainingMonths === 0) return `${years} an${years > 1 ? 's' : ''}`;
    return `${years} an${years > 1 ? 's' : ''} et ${remainingMonths} mois`;
  };



  // Kullanıcının etkinliklerini render et
  const renderUserEvents = () => {
    if (loading) {
      return (
        <div className={styles.loadingEvents}>
          <div className={styles.loadingAnimation}></div>
          <p>Chargement de votre agenda culturel...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className={styles.errorContainer}>
          <FaExclamationCircle className={styles.errorIcon} />
          <p>{error}</p>
          <button 
            className={styles.retryButton}
            onClick={fetchUserEvents}
          >
            Réessayer
          </button>
        </div>
      );
    }
    
    console.log("User events to render:", userEvents);
    
    // API yanıtının yapısını kontrol et
    let eventsToRender = userEvents;
    if (userEvents.events && Array.isArray(userEvents.events)) {
      eventsToRender = userEvents.events;
    }
    
    if (!eventsToRender || eventsToRender.length === 0) {
      return (
        <div className={styles.emptyStateContainer}>
          <div className={styles.emptyState}>
            <FaCalendarAlt className={styles.emptyStateIcon} />
            <h3>Votre agenda est vide</h3>
            <p>Rejoignez nos événements culturels et enrichissez votre expérience associative!</p>
            <Link to="/events" className={styles.discoverButton}>
              <FaSearch /> Découvrir les événements
            </Link>
          </div>
        </div>
      );
    }
    
    // Etkinlikleri tarihe göre sırala (en yakın tarihli önce)
    const sortedEvents = [...eventsToRender].sort((a, b) => {
      const dateA = new Date(a.date || a.event_date);
      const dateB = new Date(b.date || b.event_date);
      return dateA - dateB;
    });
    
    // Geçmiş ve gelecek etkinlikleri filtrele
    const now = new Date();
    const futureEvents = sortedEvents.filter(event => {
      const eventDate = new Date(event.date || event.event_date);
      return eventDate >= now;
    });
    
    const pastEvents = sortedEvents.filter(event => {
      const eventDate = new Date(event.date || event.event_date);
      return eventDate < now;
    });
    
    return (
      <div className={styles.eventsContainer}>
        <div className={styles.eventsTabs}>
          <button 
            className={`${styles.eventTab} ${!showPastEvents ? styles.activeTab : ''}`}
            onClick={() => setShowPastEvents(false)}
          >
            <FaCalendarDay /> Événements à venir ({futureEvents.length})
          </button>
          <button 
            className={`${styles.eventTab} ${showPastEvents ? styles.activeTab : ''}`}
            onClick={() => setShowPastEvents(true)}
          >
            <FaHistory /> Événements passés ({pastEvents.length})
          </button>
        </div>
        
        <div className={styles.eventsList}>
          {(showPastEvents ? pastEvents : futureEvents).map(event => {
            const eventDate = new Date(event.date || event.event_date);
            const eventType = event.type || event.event_type || 'Événement';
            
            // Etkinlik türüne göre ikon seç
            let typeIcon;
            switch(eventType.toLowerCase()) {
              case 'concert':
                typeIcon = <FaMusic />;
                break;
              case 'exposition':
                typeIcon = <FaPalette />;
                break;
              case 'conférence':
                typeIcon = <FaMicrophone />;
                break;
              case 'théâtre':
                typeIcon = <FaTheaterMasks />;
                break;
              case 'atelier':
                typeIcon = <FaTools />;
                break;
              default:
                typeIcon = <FaCalendarCheck />;
            }
            
            return (
              <div key={event.id} className={styles.eventCard}>
                <div className={styles.eventHeader}>
                  <div className={styles.eventType}>
                    {typeIcon} {eventType}
                  </div>
                  <div className={styles.eventDate}>
                    <FaCalendarAlt /> {eventDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
                
                <h3 className={styles.eventTitle}>{event.title || event.name}</h3>
                
                <div className={styles.eventDetails}>
                  {event.location && (
                    <div className={styles.eventLocation}>
                      <FaMapMarkerAlt /> {event.location}
                    </div>
                  )}
                  
                  {event.time && (
                    <div className={styles.eventTime}>
                      <FaClock /> {event.time}
                    </div>
                  )}
                </div>
                
                <div className={styles.eventActions}>
                  <button 
                    className={styles.viewEventButton}
                    onClick={() => handleViewEvent(event.id)}
                  >
                    <FaEye /> Voir les détails
                  </button>
                  <button 
                    className={styles.unregisterButton}
                    onClick={() => handleUnregister(event.id)}
                  >
                    <FaSignOutAlt /> Se désinscrire
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Kullanıcı genel bakış sayfasını render et
  const renderOverview = () => {
    return (
      <div className={styles.overviewContainer}>
        <div className={styles.statsCards}>
          <div className={styles.statsCard}>
            <div className={styles.statsIcon}>
              <FaCalendarCheck />
            </div>
            <div className={styles.statsInfo}>
              <span className={styles.statsValue}>{userEvents.length}</span>
              <span className={styles.statsLabel}>Événements</span>
            </div>
          </div>
          

          
          <div className={styles.statsCard}>
            <div className={styles.statsIcon}>
              <FaBirthdayCake />
            </div>
            <div className={styles.statsInfo}>
              <span className={styles.statsValue}>{calculateMembershipDuration()}</span>
              <span className={styles.statsLabel}>Membre depuis</span>
            </div>
          </div>
        </div>
        
        <div className={styles.twoColumnLayout}>
          <div className={styles.leftColumn}>
            <div className={styles.membershipSection}>
              <h2>Votre adhésion</h2>
              <div className={styles.membershipCard}>
                <div className={styles.membershipStatus}>
                  Membre actif
                </div>
                <div className={styles.membershipDetails}>
                  <p><strong>Numéro d'adhérent:</strong> {user.id}A{new Date().getFullYear()}</p>
                  <p><strong>Date d'adhésion:</strong> {new Date(user.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p><strong>Statut:</strong> Actif</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles.rightColumn}>
            <div className={styles.upcomingEvents}>
              <h2><FaCalendarCheck /> Vos prochains événements</h2>
              {userEvents.length > 0 ? (
                <>
                  <div className={styles.eventsList}>
                    {userEvents.slice(0, 3).map(event => {
                      const eventDate = new Date(event.date || event.event_date);
                      const eventType = event.type || event.event_type || 'Événement';
                      
                      // Etkinlik türüne göre ikon seç
                      let typeIcon;
                      switch(eventType.toLowerCase()) {
                        case 'concert':
                          typeIcon = <FaMusic />;
                          break;
                        case 'exposition':
                          typeIcon = <FaPalette />;
                          break;
                        case 'conférence':
                          typeIcon = <FaMicrophone />;
                          break;
                        case 'théâtre':
                          typeIcon = <FaTheaterMasks />;
                          break;
                        case 'atelier':
                          typeIcon = <FaTools />;
                          break;
                        default:
                          typeIcon = <FaCalendarCheck />;
                      }
                      
                      return (
                        <div key={event.id} className={styles.eventCard}>
                          <div className={styles.eventHeader}>
                            <div className={styles.eventType}>
                              {typeIcon} {eventType}
                            </div>
                            <div className={styles.eventDate}>
                              <FaCalendarAlt /> {eventDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                          </div>
                          
                          <h3 className={styles.eventTitle}>{event.title || event.name}</h3>
                          
                          <div className={styles.eventActions}>
                            <button 
                              className={styles.viewEventButton}
                              onClick={() => handleViewEvent(event.id)}
                            >
                              <FaEye /> Voir les détails
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <button 
                    className={styles.viewAllButton}
                    onClick={() => setActiveTab('events')}
                  >
                    Voir tous les événements
                  </button>
                </>
              ) : (
                <div className={styles.emptyStateContainer}>
                  <div className={styles.emptyState}>
                    <FaCalendarAlt className={styles.emptyStateIcon} />
                    <h3>Votre agenda est vide</h3>
                    <p>Rejoignez nos événements culturels et enrichissez votre expérience associative!</p>
                    <Link to="/events" className={styles.discoverButton}>
                      <FaSearch /> Découvrir les événements
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Kullanıcı ayarlarını render et
  const renderSettings = () => {
    return (
      <div className={styles.settingsContainer}>
        <h2>Paramètres du compte</h2>
        
        <div className={styles.editProfileForm}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="firstName">Prénom</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="lastName">Nom</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="profileImage">URL de l'image de profil</label>
              <input
                type="text"
                id="profileImage"
                name="profileImage"
                value={formData.profileImage}
                onChange={handleChange}
              />
            </div>
            
            <div className={styles.formActions}>
              <button type="submit" className={styles.saveButton}>
                Enregistrer
              </button>
            </div>
          </form>
        </div>
        
        <div className={styles.dangerZone}>
          <h3>Zone de danger</h3>
          <button className={styles.deleteAccountButton}>
            Supprimer mon compte
          </button>
        </div>
      </div>
    );
  };

  // Etkinlikten ayrılma fonksiyonu
  const handleUnregister = async (eventId) => {
    try {
        const response = await axios.delete(
            `https://association-action-plus.onrender.com/api/events/${eventId}/register`,
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            }
        );

        if (response.status === 200) {
            // Etkinlik listelerini güncelle
            setUserEvents(userEvents.filter(event => event.id !== eventId));
        }
    } catch (error) {
        console.error('Error unregistering from event:', error);
        alert('Erreur lors de la désinscription de l\'événement');
    }
  };

  if (!user) {
    return <div className={styles.loading}>Chargement...</div>;
  }

  return (
    <div className={`${styles.profilePage} ${animateProfile ? styles.animateProfile : ''}`} ref={profileRef}>
        <div className={styles.profileHeader}>
            <div className={styles.profileAvatar}>
                {user.profileImage ? (
                    <img src={user.profileImage} alt={`${user.firstName} ${user.lastName}`} />
                ) : (
                    <div className={styles.defaultAvatar}>
                        <FaUser />
                    </div>
                )}
            </div>
            
            <div className={styles.profileInfo}>
                <h1>{user.firstName} {user.lastName}</h1>
                <p className={styles.userEmail}><FaEnvelope /> {user.email}</p>
                
                <div className={styles.userBadges}>
                    <span className={styles.userBadge} title="Membre actif">
                        <FaUserFriends />
                    </span>

                    {userEvents.length > 5 && (
                        <span className={styles.userBadge} title="Participant régulier">
                            <FaStar />
                        </span>
                    )}
                </div>
            </div>
            
            <div className={styles.profileActions}>
                <button className={styles.logoutButton} onClick={logout}>
                    <FaSignOutAlt /> Se déconnecter
                </button>
            </div>
        </div>
        
        {successMessage && (
            <div className={styles.successMessage}>
                <FaCheckCircle /> {successMessage}
            </div>
        )}
        
        {error && (
            <div className={styles.errorMessage}>
                <FaExclamationCircle /> {error}
            </div>
        )}
        
        <div className={styles.profileNavigation}>
            <button 
                className={`${styles.navButton} ${activeTab === 'overview' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('overview')}
            >
                <FaUser /> Vue d'ensemble
            </button>
            <button 
                className={`${styles.navButton} ${activeTab === 'events' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('events')}
            >
                <FaCalendarCheck /> Événements
            </button>

            <button 
                className={`${styles.navButton} ${activeTab === 'settings' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('settings')}
            >
                <FaEdit /> Paramètres
            </button>
        </div>
        
        <div className={styles.profileContent}>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'events' && renderUserEvents()}
            {activeTab === 'settings' && renderSettings()}
        </div>


    </div>
  );
};

export default ProfilePage;