import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Events.module.css';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaUsers, FaMapMarkerAlt, FaClock, FaHistory, FaPlus, FaStar } from 'react-icons/fa';
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

    const upcomingCarouselRef = useRef(null);
    const pastCarouselRef = useRef(null);

    // Tüm etkinlikleri çek - Component mount olduğunda çalışır
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                console.log('Fetching events...');
                const response = await fetch('http://localhost:8000/api/events');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log('Events data:', data);
                setEvents(data);
                setLoading(false);

                // Bugünün tarihini al
                const today = new Date();
                
                // İki yıl önceki tarihi hesapla
                const twoYearsAgo = new Date();
                twoYearsAgo.setFullYear(today.getFullYear() - 2);
                
                // Etkinlikleri gelecek ve geçmiş olarak ayır
                const upcoming = [];
                const past = [];
                
                // Mock veri ekleyelim (gerçek API'dan gelen veriye ek olarak)
                const mockEvents = generateMockEvents(15);
                const allEvents = [...data, ...mockEvents];
                
                allEvents.forEach(event => {
                    const eventDate = new Date(event.date);
                    
                    if (eventDate >= today) {
                        // Gelecek etkinlikler
                        upcoming.push(event);
                    } else if (eventDate >= twoYearsAgo) {
                        // Son 2 yıldaki geçmiş etkinlikler
                        past.push(event);
                    }
                });
                
                // Gelecek etkinlikleri tarihe göre sırala (yakın tarihli önce)
                upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
                
                // Geçmiş etkinlikleri tarihe göre sırala (yakın tarihli önce)
                past.sort((a, b) => new Date(b.date) - new Date(a.date));
                
                setUpcomingEvents(upcoming);
                setPastEvents(past);
            } catch (err) {
                console.error('Error fetching events:', err);
                setError('Impossible de charger les événements');
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    // Mock etkinlikler oluştur
    const generateMockEvents = (count) => {
        const mockEvents = [];
        const eventTypes = [
            'Conférence culturelle',
            'Exposition d\'art',
            'Concert de musique traditionnelle',
            'Atelier de cuisine',
            'Projection de film',
            'Soirée littéraire',
            'Danse folklorique',
            'Célébration festive'
        ];
        
        const locations = [
            'Centre culturel, Paris',
            'Salle des fêtes, Lyon',
            'Espace communautaire, Marseille',
            'Maison des associations, Bordeaux',
            'Galerie d\'art, Strasbourg',
            'Théâtre municipal, Lille',
            'Bibliothèque centrale, Toulouse'
        ];
        
        const images = [
            'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80',
            'https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
            'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
            'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80',
            'https://images.unsplash.com/photo-1505236858219-8359eb29e329?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1262&q=80',
            'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80'
        ];
        
        for (let i = 0; i < count; i++) {
            // Rastgele tarih oluştur (geçmiş veya gelecek)
            const randomDate = new Date();
            // -24 ile +24 ay arasında rastgele bir tarih
            randomDate.setMonth(randomDate.getMonth() + Math.floor(Math.random() * 48) - 24);
            
            const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
            const location = locations[Math.floor(Math.random() * locations.length)];
            const image = images[Math.floor(Math.random() * images.length)];
            
            mockEvents.push({
                _id: `mock-event-${i}`,
                id: `mock-event-${i}`,
                title: `${eventType} #${i+1}`,
                description: `Une expérience culturelle unique qui vous permettra de découvrir les traditions et coutumes de notre communauté. Rejoignez-nous pour un moment de partage et d'échange culturel.`,
                date: randomDate.toISOString(),
                time: `${Math.floor(Math.random() * 12) + 10}:${Math.random() > 0.5 ? '00' : '30'}`,
                location: location,
                image: image,
                participants: Math.floor(Math.random() * 50) + 10,
                maxParticipants: 100,
                isFeatured: Math.random() > 0.7
            });
        }
        
        return mockEvents;
    };

    // fetchUserEvents fonksiyonunu useCallback ile tanımlayalım
    const fetchUserEvents = useCallback(async () => {
        if (!accessToken || !user) return;

        try {
            const response = await axios.get('http://localhost:8000/api/users/me/events', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                }
            });
            
            console.log('User events response:', response.data);
            setUserEvents(response.data.events || []);
        } catch (error) {
            console.error('Fetch user events error:', error.response || error);
        }
    }, [accessToken, user]);

    // Kullanıcının katıldığı etkinlikleri çek - User veya token değiştiğinde çalışır
    useEffect(() => {
        if (user) {
            fetchUserEvents();
        }
    }, [user, fetchUserEvents]);

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

    // Etkinliğe katılma veya ayrılma işlemi
    const handleJoinEvent = async (event) => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            const eventId = event._id || event.id;
            
            // Kullanıcının zaten kayıtlı olup olmadığını kontrol et
            const isRegistered = userEvents.some(e => 
                String(e._id || e.id) === String(eventId)
            );
            
            if (isRegistered) {
                // Etkinlikten ayrıl
                const response = await axios.delete(
                    `http://localhost:8000/api/events/${eventId}/register`,
                    {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    }
                );
                
                console.log('Leave event response:', response.data);
                
                // Kullanıcının etkinliklerini güncelle
                fetchUserEvents();
                
                alert('Vous vous êtes désinscrit de cet événement avec succès!');
            } else {
                // Etkinliğe katıl
                const response = await axios.post(
                    `http://localhost:8000/api/events/${eventId}/join`,
                    {},
                    {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        }
                    }
                );
                
                console.log('Join event response:', response.data);
                
                // Kullanıcının etkinliklerini güncelle
                fetchUserEvents();
                
                alert('Vous êtes inscrit à cet événement avec succès!');
            }
        } catch (error) {
            console.error('Event action error:', error.response || error);
            
            if (error.response && error.response.status === 400) {
                alert('Vous êtes déjà inscrit à cet événement.');
            } else {
                alert('Erreur lors de l\'action sur l\'événement. Veuillez réessayer.');
            }
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
                    handleJoinEvent(event);
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
                    <Link to="/create-event" className={styles.createButton}>
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
                                            
                                            <EventActionButton event={event} />
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