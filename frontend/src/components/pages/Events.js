import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Events.module.css';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaUsers, FaMapMarkerAlt, FaClock, FaHistory, FaPlus, FaStar, FaEye, FaCheckCircle, FaCalendarCheck, FaMusic, FaPalette, FaMicrophone, FaTheaterMasks, FaTools, FaCalendarDay, FaCrown } from 'react-icons/fa';
import ConfirmModal from '../Modal/ConfirmModal';

const Events = () => {
    const [events, setEvents] = useState([]);
    const [userEvents, setUserEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { accessToken, user, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [pastEvents, setPastEvents] = useState([]);
    const [activeUpcomingIndex, setActiveUpcomingIndex] = useState(0);
    const [activePastIndex, setActivePastIndex] = useState(0);
    const [successMessage, setSuccessMessage] = useState(null);

    const upcomingCarouselRef = useRef(null);
    const pastCarouselRef = useRef(null);

    // fetchUserEvents fonksiyonunu useCallback ile tanımlayalım
    const fetchUserEvents = useCallback(async () => {
        if (!user) return;

        try {
            const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
            if (!token) return;
            
            console.log('Fetching user events with token:', token.substring(0, 10) + '...');
            
            const response = await axios({
                method: 'get',
                url: 'http://localhost:8000/api/users/me/events',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('User events response:', response.data);
            setUserEvents(response.data.events || []);
        } catch (error) {
            console.error('Fetch user events error:', error.response || error);
        }
    }, [user]);

    // Etkinlikleri getir fonksiyonu
    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8000/api/events');
            
            if (response.data) {
                const allEvents = Array.isArray(response.data) ? response.data : [];
                setEvents(allEvents);
                
                // Gelecek ve geçmiş etkinlikleri ayır
                const now = new Date();
                const upcoming = allEvents.filter(event => new Date(event.date) >= now);
                const past = allEvents.filter(event => new Date(event.date) < now);
                
                setUpcomingEvents(upcoming);
                setPastEvents(past);
            }
            
            setLoading(false);
            
            // Kullanıcı giriş yapmışsa, katıldığı etkinlikleri kontrol et
            if (accessToken) {
                checkUserParticipation();
            }
        } catch (error) {
            console.error('Error fetching events:', error);
            setError('Erreur lors du chargement des événements. Veuillez réessayer.');
            setLoading(false);
        }
    };

    // Tüm etkinlikleri çek - Component mount olduğunda çalışır
    useEffect(() => {
        console.log('Events component mounted');
        fetchEvents();
    }, []);

    // Kullanıcının katıldığı etkinlikleri çek - User veya token değiştiğinde çalışır
    useEffect(() => {
        if (user) {
            try {
                fetchUserEvents();
            } catch (error) {
                console.error('Error fetching user events:', error);
            }
        }
    }, [user, fetchUserEvents]);

    // Etkinlik tipine göre ikon getir
    const getEventTypeIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'concert':
                return <FaMusic />;
            case 'exposition':
                return <FaPalette />;
            case 'conférence':
                return <FaMicrophone />;
            case 'théâtre':
                return <FaTheaterMasks />;
            case 'atelier':
                return <FaTools />;
            case 'festival':
                return <FaCalendarDay />;
            case 'gala':
                return <FaCrown />;
            default:
                return <FaCalendarAlt />;
        }
    };

    // Carousel kontrolleri - Gelecek etkinlikler
    const scrollUpcoming = (direction) => {
        if (upcomingCarouselRef.current) {
            const { scrollLeft, clientWidth } = upcomingCarouselRef.current;
            const scrollTo = direction === 'left' 
                ? scrollLeft - clientWidth 
                : scrollLeft + clientWidth;
            
            upcomingCarouselRef.current.scrollTo({
                left: scrollTo,
                behavior: 'smooth'
            });
            
            // Aktif indeksi güncelle
            const newIndex = direction === 'left' 
                ? Math.max(0, activeUpcomingIndex - 1)
                : Math.min(upcomingEvents.length - 1, activeUpcomingIndex + 1);
            setActiveUpcomingIndex(newIndex);
        }
    };
    
    // Carousel kontrolleri - Geçmiş etkinlikler
    const scrollPast = (direction) => {
        if (pastCarouselRef.current) {
            const { scrollLeft, clientWidth } = pastCarouselRef.current;
            const scrollTo = direction === 'left' 
                ? scrollLeft - clientWidth 
                : scrollLeft + clientWidth;
            
            pastCarouselRef.current.scrollTo({
                left: scrollTo,
                behavior: 'smooth'
            });
            
            // Aktif indeksi güncelle
            const newIndex = direction === 'left' 
                ? Math.max(0, activePastIndex - 1)
                : Math.min(pastEvents.length - 1, activePastIndex + 1);
            setActivePastIndex(newIndex);
        }
    };

    // Kullanıcının etkinliğe katılıp katılmadığını kontrol et
    const checkUserParticipation = async () => {
        if (!user) return;
        
        try {
            // Kullanıcının katıldığı etkinlikleri getir
            try {
                const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
                if (!token) return;
                
                console.log('Using token for checking participation:', token);
                
                const response = await axios.get('http://localhost:8000/api/users/me/events', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const userEvents = response.data.events || [];
                console.log('User events:', userEvents);
                
                // Kullanıcının katıldığı etkinliklerin ID'lerini al
                const participatedEventIds = userEvents.map(event => String(event.id || event._id));
                console.log('Participated event IDs:', participatedEventIds);
                
                // Etkinlikleri güncelle, kullanıcının katıldığı etkinlikleri işaretle
                setEvents(prevEvents => prevEvents.map(event => ({
                    ...event,
                    isParticipating: participatedEventIds.includes(String(event.id || event._id))
                })));
                
                // Gelecek ve geçmiş etkinlikleri de güncelle
                setUpcomingEvents(prevEvents => prevEvents.map(event => ({
                    ...event,
                    isParticipating: participatedEventIds.includes(String(event.id || event._id))
                })));
                
                setPastEvents(prevEvents => prevEvents.map(event => ({
                    ...event,
                    isParticipating: participatedEventIds.includes(String(event.id || event._id))
                })));
            } catch (error) {
                console.error('Error fetching user events, using alternative method:', error);
                
                // Alternatif olarak, tüm etkinlikleri getir
                const allEventsResponse = await axios.get('http://localhost:8000/api/events');
                const allEvents = allEventsResponse.data;
                
                // Etkinlikleri güncelle
                setEvents(allEvents);
            }
        } catch (error) {
            console.error('Error checking user participation:', error);
        }
    };

    // Etkinliğe katıl veya çık
    const joinEvent = async (eventId) => {
        if (!user) {
            navigate('/login', { state: { from: '/events' } });
            return;
        }
        
        try {
            // Önce etkinliğin durumunu kontrol et
            const event = events.find(e => String(e.id) === String(eventId) || String(e._id) === String(eventId));
            const isAlreadyRegistered = event?.isParticipating;
            
            console.log('Event:', event);
            console.log('Is already registered:', isAlreadyRegistered);
            
            // Token'ı al
            const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                navigate('/login', { state: { from: '/events' } });
                return;
            }
            
            // Eğer zaten kayıtlıysa, kaydı sil
            if (isAlreadyRegistered) {
                console.log('Leaving event with ID:', eventId);
                console.log('Using token for leaving event:', token.substring(0, 10) + '...');
                
                try {
                    const response = await axios({
                        method: 'delete',
                        url: `http://localhost:8000/api/events/${eventId}/register`,
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    console.log('Leave event response:', response.data);
                    
                    // Başarılı mesajı göster
                    setSuccessMessage('Vous êtes désinscrit de cet événement!');
                    setTimeout(() => setSuccessMessage(null), 3000);
                    
                    // Etkinliği güncelle
                    setEvents(prevEvents => prevEvents.map(e => 
                        (String(e.id) === String(eventId) || String(e._id) === String(eventId)) 
                            ? { ...e, isParticipating: false } 
                            : e
                    ));
                    
                    // Gelecek ve geçmiş etkinlikleri de güncelle
                    setUpcomingEvents(prevEvents => prevEvents.map(e => 
                        (String(e.id) === String(eventId) || String(e._id) === String(eventId)) 
                            ? { ...e, isParticipating: false } 
                            : e
                    ));
                    
                    setPastEvents(prevEvents => prevEvents.map(e => 
                        (String(e.id) === String(eventId) || String(e._id) === String(eventId)) 
                            ? { ...e, isParticipating: false } 
                            : e
                    ));
                    
                    // Sayfanın yukarı kaymasını engelle
                    window.scrollTo(window.scrollX, window.scrollY);
                    
                    // Kullanıcının etkinliklerini güncelle
                    await fetchUserEvents();
                } catch (error) {
                    console.error('Error leaving event:', error.response || error);
                    setError(error.response?.data?.detail || 'Erreur lors de la désinscription');
                    setTimeout(() => setError(null), 3000);
                }
            } 
            // Değilse, etkinliğe katıl
            else {
                console.log('Joining event with ID:', eventId);
                console.log('Using token for joining event:', token.substring(0, 10) + '...');
                
                try {
                    const response = await axios({
                        method: 'post',
                        url: `http://localhost:8000/api/events/${eventId}/join`,
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        data: {}
                    });
                    
                    console.log('Join event response:', response.data);
                    
                    // Başarılı mesajı göster
                    setSuccessMessage('Vous êtes inscrit à cet événement!');
                    setTimeout(() => setSuccessMessage(null), 3000);
                    
                    // Etkinliği güncelle
                    setEvents(prevEvents => prevEvents.map(e => 
                        (String(e.id) === String(eventId) || String(e._id) === String(eventId)) 
                            ? { ...e, isParticipating: true } 
                            : e
                    ));
                    
                    // Gelecek ve geçmiş etkinlikleri de güncelle
                    setUpcomingEvents(prevEvents => prevEvents.map(e => 
                        (String(e.id) === String(eventId) || String(e._id) === String(eventId)) 
                            ? { ...e, isParticipating: true } 
                            : e
                    ));
                    
                    setPastEvents(prevEvents => prevEvents.map(e => 
                        (String(e.id) === String(eventId) || String(e._id) === String(eventId)) 
                            ? { ...e, isParticipating: true } 
                            : e
                    ));
                    
                    // Sayfanın yukarı kaymasını engelle
                    window.scrollTo(window.scrollX, window.scrollY);
                    
                    // Kullanıcının etkinliklerini güncelle
                    await fetchUserEvents();
                } catch (error) {
                    console.error('Error joining event:', error.response || error);
                    setError(error.response?.data?.detail || 'Erreur lors de l\'inscription');
                    setTimeout(() => setError(null), 3000);
                }
            }
        } catch (error) {
            console.error('Error with event registration:', error.response || error);
            setError(error.response?.data?.detail || 'Erreur lors de l\'opération');
            setTimeout(() => setError(null), 3000);
        }
    };

    // Etkinlik silme işlemi
    const handleDeleteEvent = (eventId) => {
        setEventToDelete(eventId);
        setShowConfirmModal(true);
    };

    // Etkinlik silme onayı
    const confirmDeleteEvent = async () => {
        if (!eventToDelete) return;

        try {
            await axios.delete(`http://localhost:8000/api/events/${eventToDelete}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                }
            });
            
            // Etkinlik listesini güncelle
            setEvents(prevEvents => prevEvents.filter(event => event._id !== eventToDelete));
            setUpcomingEvents(prevEvents => prevEvents.filter(event => event._id !== eventToDelete));
            setPastEvents(prevEvents => prevEvents.filter(event => event._id !== eventToDelete));
            
            // Modal'ı kapat
            setShowConfirmModal(false);
            setEventToDelete(null);
            
        } catch (error) {
            console.error('Delete event error:', error.response || error);
        }
    };

    // Tarih formatı
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    // Kullanıcının etkinliğe katılıp katılmadığını kontrol et
    const isUserJoined = (eventId) => {
        return userEvents.some(event => event._id === eventId);
    };

    // Etkinlik kartına tıklama işlemi için debug
    const handleEventClick = (event) => {
        console.log("Tıklanan etkinlik:", event);
        console.log("Yönlendirme URL'i:", `/events/${event._id || event.id}`);
        // navigate(`/events/${event._id || event.id}`);
    };

    // Etkinlik kartlarında kullanılacak katılma butonu
    const EventActionButton = ({ event }) => {
        const isRegistered = userEvents.some(e => 
            String(e._id || e.id) === String(event._id || event.id)
        );
        
        return (
            <button 
                className={`${styles.actionButton} ${isRegistered ? styles.registeredButton : styles.registerButton}`}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    joinEvent(event._id || event.id);
                }}
            >
                <div className={styles.buttonContent}>
                    <span className={styles.buttonIcon}>
                        {isRegistered ? '✓' : '+'}
                    </span>
                    <span className={styles.buttonText}>
                        {isRegistered ? 'Inscrit' : 'Participer'}
                    </span>
                </div>
                <div className={styles.buttonHoverText}>
                    {isRegistered ? 'Se désinscrire' : 'S\'inscrire'}
                </div>
            </button>
        );
    };

    // Etkinlik kartı bileşeni
    const EventCard = ({ event }) => {
        const eventDate = new Date(event.date);
        const isUpcoming = eventDate >= new Date();
        
        return (
            <div className={styles.eventCard}>
                <div className={styles.eventHeader}>
                    <div className={styles.eventType}>
                        {getEventTypeIcon(event.type)} {event.type}
                    </div>
                    <div className={styles.eventDate}>
                        <FaCalendarAlt /> {eventDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                </div>
                
                <h3 className={styles.eventTitle}>{event.title}</h3>
                <p className={styles.eventDescription}>{event.description}</p>
                
                <div className={styles.eventActions}>
                    <button 
                        className={styles.viewEventButton}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(`/events/${event.id || event._id}`);
                        }}
                    >
                        <FaEye /> Voir les détails
                    </button>
                    
                    {isUpcoming && (
                        <button 
                            className={`${styles.registerButton} ${event.isParticipating ? styles.alreadyRegistered : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                joinEvent(event.id || event._id);
                            }}
                        >
                            {event.isParticipating ? (
                                <>
                                    <FaCheckCircle /> Inscrit
                                </>
                            ) : (
                                <>
                                    <FaCalendarCheck /> S'inscrire
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loader}></div>
                <p>Chargement des événements...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <p className={styles.errorMessage}>{error}</p>
                <button 
                    className={styles.retryButton}
                    onClick={() => window.location.reload()}
                >
                    Réessayer
                </button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.headerSection}>
                <h1 className={styles.title}>
                    <FaCalendarAlt className={styles.titleIcon} /> 
                    Nos Événements
                </h1>
                
                {isAdmin && (
                    <Link to="/events/create" className={styles.createButton}>
                        <FaPlus /> Créer un événement
                    </Link>
                )}
            </div>
            
            {/* Gelecek Etkinlikler Carousel */}
            <section className={styles.eventsSection}>
                <h2 className={styles.sectionTitle}>
                    <FaCalendarAlt /> Événements à venir
                </h2>
                
                {upcomingEvents.length > 0 ? (
                    <div className={styles.carouselContainer}>
                        <div className={styles.carouselBackground}></div>
                        <button 
                            className={`${styles.navButton} ${styles.prevButton}`} 
                            onClick={() => scrollUpcoming('left')}
                            aria-label="Événements précédents"
                            disabled={activeUpcomingIndex === 0}
                        >
                            <FaChevronLeft />
                        </button>
                        
                        <div className={styles.carousel} ref={upcomingCarouselRef}>
                            {upcomingEvents.map((event, index) => (
                                <div 
                                    key={event._id} 
                                    className={`${styles.eventCard} ${event.isFeatured ? styles.featuredEvent : ''}`}
                                >
                                    {event.isFeatured && (
                                        <div className={styles.featuredBadge}>
                                            <FaStar /> Événement spécial
                                        </div>
                                    )}
                                    <div className={styles.eventImageContainer}>
                                        <img 
                                            src={event.image || 'https://via.placeholder.com/300x200?text=Événement'} 
                                            alt={event.title} 
                                            className={styles.eventImage}
                                        />
                                        <div className={styles.eventDate}>
                                            <span className={styles.day}>
                                                {new Date(event.date).getDate()}
                                            </span>
                                            <span className={styles.month}>
                                                {new Date(event.date).toLocaleDateString('fr-FR', { month: 'short' })}
                                            </span>
                                        </div>
                                        
                                        <div className={styles.participantsInfo}>
                                            <FaUsers /> {event.participants?.length || 0} / {event.maxParticipants || '∞'}
                                        </div>
                                    </div>
                                    
                                    <div className={styles.eventContent}>
                                        <h3 className={styles.eventTitle}>{event.title}</h3>
                                        
                                        <div className={styles.eventDetails}>
                                            <p className={styles.eventLocation}>
                                                <FaMapMarkerAlt /> {event.location}
                                            </p>
                                            <p className={styles.eventTime}>
                                                <FaClock /> {event.time || '19:00'}
                                            </p>
                                        </div>
                                        
                                        <p className={styles.eventDescription}>
                                            {event.description.length > 100 
                                                ? `${event.description.substring(0, 100)}` 
                                                : event.description}
                                        </p>
                                        
                                        <div className={styles.eventActions}>
                                            <Link 
                                                to={`/events/${event._id || event.id}`} 
                                                className={styles.eventButton}
                                                onClick={() => handleEventClick(event)}
                                            >
                                                Voir les détails
                                            </Link>
                                            
                                            {(user || isAdmin) && <EventActionButton event={event} />}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <button 
                            className={`${styles.navButton} ${styles.nextButton}`} 
                            onClick={() => scrollUpcoming('right')}
                            aria-label="Événements suivants"
                            disabled={activeUpcomingIndex >= upcomingEvents.length - 1}
                        >
                            <FaChevronRight />
                        </button>
                        
                        <div className={styles.carouselIndicators}>
                            {upcomingEvents.slice(0, Math.min(5, upcomingEvents.length)).map((_, index) => (
                                <span 
                                    key={index} 
                                    className={`${styles.indicator} ${index === activeUpcomingIndex ? styles.activeIndicator : ''}`}
                                    onClick={() => {
                                        if (upcomingCarouselRef.current) {
                                            upcomingCarouselRef.current.scrollTo({
                                                left: index * upcomingCarouselRef.current.clientWidth,
                                                behavior: 'smooth'
                                            });
                                            setActiveUpcomingIndex(index);
                                        }
                                    }}
                                />
                            ))}
                            {upcomingEvents.length > 5 && <span className={styles.moreIndicator}></span>}
                        </div>
                    </div>
                ) : (
                    <p className={styles.noEvents}>
                        Aucun événement à venir pour le moment. Revenez bientôt !
                    </p>
                )}
            </section>
            
            {/* Geçmiş Etkinlikler Carousel */}
            <section className={styles.eventsSection}>
                <h2 className={styles.sectionTitle}>
                    <FaHistory /> Événements passés
                </h2>
                
                {pastEvents.length > 0 ? (
                    <div className={styles.carouselContainer}>
                        <div className={styles.carouselBackground}></div>
                        <button 
                            className={`${styles.navButton} ${styles.prevButton}`} 
                            onClick={() => scrollPast('left')}
                            aria-label="Événements précédents"
                            disabled={activePastIndex === 0}
                        >
                            <FaChevronLeft />
                        </button>
                        
                        <div className={styles.carousel} ref={pastCarouselRef}>
                            {pastEvents.map(event => (
                                <div key={event._id} className={`${styles.eventCard} ${styles.pastEvent}`}>
                                    <div className={styles.eventImageContainer}>
                                        <img 
                                            src={event.image || 'https://via.placeholder.com/300x200?text=Événement+Passé'} 
                                            alt={event.title} 
                                            className={styles.eventImage}
                                        />
                                        <div className={styles.eventDate}>
                                            <span className={styles.day}>
                                                {new Date(event.date).getDate()}
                                            </span>
                                            <span className={styles.month}>
                                                {new Date(event.date).toLocaleDateString('fr-FR', { month: 'short' })}
                                            </span>
                                        </div>
                                        <div className={styles.pastEventBadge}>Passé</div>
                                    </div>
                                    
                                    <div className={styles.eventContent}>
                                        <h3 className={styles.eventTitle}>{event.title}</h3>
                                        
                                        <div className={styles.eventDetails}>
                                            <p className={styles.eventLocation}>
                                                <FaMapMarkerAlt /> {event.location}
                                            </p>
                                            <p className={styles.eventTime}>
                                                <FaClock /> {formatDate(event.date)}
                                            </p>
                                        </div>
                                        
                                        <p className={styles.eventDescription}>
                                            {event.description.length > 100 
                                                ? `${event.description.substring(0, 100)}` 
                                                : event.description}
                                        </p>
                                        
                                        <Link 
                                            to={`/events/${event._id || event.id}`} 
                                            className={styles.eventButton}
                                            onClick={() => handleEventClick(event)}
                                        >
                                            Voir les détails
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <button 
                            className={`${styles.navButton} ${styles.nextButton}`} 
                            onClick={() => scrollPast('right')}
                            aria-label="Événements suivants"
                            disabled={activePastIndex >= pastEvents.length - 1}
                        >
                            <FaChevronRight />
                        </button>
                        
                        <div className={styles.carouselIndicators}>
                            {pastEvents.slice(0, Math.min(5, pastEvents.length)).map((_, index) => (
                                <span 
                                    key={index} 
                                    className={`${styles.indicator} ${index === activePastIndex ? styles.activeIndicator : ''}`}
                                    onClick={() => {
                                        if (pastCarouselRef.current) {
                                            pastCarouselRef.current.scrollTo({
                                                left: index * pastCarouselRef.current.clientWidth,
                                                behavior: 'smooth'
                                            });
                                            setActivePastIndex(index);
                                        }
                                    }}
                                />
                            ))}
                            {pastEvents.length > 5 && <span className={styles.moreIndicator}></span>}
                        </div>
                    </div>
                ) : (
                    <p className={styles.noEvents}>
                        Aucun événement passé à afficher.
                    </p>
                )}
            </section>

            {showConfirmModal && (
                <ConfirmModal 
                    message="Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible."
                    onConfirm={confirmDeleteEvent}
                    onCancel={() => {
                        setShowConfirmModal(false);
                        setEventToDelete(null);
                    }}
                    confirmText="Supprimer"
                    cancelText="Annuler"
                />
            )}
        </div>
    );
};

export default Events;