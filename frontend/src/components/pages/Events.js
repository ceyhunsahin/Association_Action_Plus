import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Events.module.css';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaUsers } from 'react-icons/fa';
import ConfirmModal from '../Modal/ConfirmModal';

const Events = () => {
    const [events, setEvents] = useState([]);
    const [userEvents, setUserEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { accessToken, user, isAdmin } = useAuth();
    const navigate = useNavigate();
    const sliderRef = useRef(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);

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
            } catch (err) {
                console.error('Error fetching events:', err);
                setError('Impossible de charger les événements');
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

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

    // Slider kontrolleri
    const scrollLeft = () => {
        if (sliderRef.current) {
            sliderRef.current.scrollBy({ left: -300, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (sliderRef.current) {
            sliderRef.current.scrollBy({ left: 300, behavior: 'smooth' });
        }
    };

    // Etkinliğe katılma işlemi
    const handleJoinEvent = async (eventId) => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
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
            
            // Kullanıcının etkinliklerini yeniden çek
            await fetchUserEvents();
            
            // Tüm etkinlikleri yeniden çek (katılımcı sayısını güncellemek için)
            const eventsResponse = await fetch('http://localhost:8000/api/events');
            if (eventsResponse.ok) {
                const data = await eventsResponse.json();
                setEvents(data);
            }
            
            alert('Inscription à l\'événement réussie');
        } catch (error) {
            console.error('Join event error:', error.response || error);
            alert('Erreur lors de l\'inscription à l\'événement');
        }
    };

    // Etkinliği silme işlemi
    const handleDeleteEvent = (eventId) => {
        setEventToDelete(eventId);
        setShowConfirmModal(true);
    };

    // Etkinliği silme onayı
    const confirmDeleteEvent = async () => {
        try {
            await axios.delete(`http://localhost:8000/api/events/${eventToDelete}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            
            // Etkinlik listesini güncelle
            const updatedEvents = events.filter(event => event.id !== eventToDelete);
            setEvents(updatedEvents);
            
            setShowConfirmModal(false);
            setEventToDelete(null);
            
            alert('Événement supprimé avec succès!');
        } catch (err) {
            console.error('Error deleting event:', err);
            alert('Erreur lors de la suppression de l\'événement');
            setShowConfirmModal(false);
            setEventToDelete(null);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Chargement...</div>;
    }

    if (error) {
        return (
            <div className={styles.error}>
                <p>{error}</p>
                <button 
                    onClick={() => window.location.reload()} 
                    className={styles.retryButton}
                >
                    Réessayer
                </button>
            </div>
        );
    }

    return (
        <div className={styles.eventsContainer}>
            <h1 className={styles.title}>Événements</h1>
            
            {user && user.role === 'admin' && (
                <div className={styles.adminActions}>
                    <Link to="/events/create" className={styles.createButton}>
                        Créer un nouvel événement
                    </Link>
                </div>
            )}
            
            {events.length === 0 ? (
                <p className={styles.noEvents}>Aucun événement à afficher</p>
            ) : (
                <div className={styles.carouselContainer}>
                    <button 
                        className={`${styles.carouselButton} ${styles.prevButton}`}
                        onClick={scrollLeft}
                        aria-label="Précédent"
                    >
                        <FaChevronLeft />
                    </button>
                    
                    <div className={styles.carousel} ref={sliderRef}>
                        {events.map(event => (
                            <div key={event.id} className={styles.eventCard}>
                                <div className={styles.eventImageContainer}>
                                    <img 
                                        src={event.image || "https://picsum.photos/800/400?random=" + event.id} 
                                        alt={event.title} 
                                        className={styles.eventImage}
                                    />
                                    <div className={styles.eventOverlay}>
                                        <Link to={`/events/${event.id}`} className={styles.overlayButton}>
                                            Voir les détails
                                        </Link>
                                    </div>
                                </div>
                                <div className={styles.eventContent}>
                                    <h2 className={styles.eventTitle}>{event.title}</h2>
                                    <div className={styles.eventMeta}>
                                        <p className={styles.eventDate}>
                                            <FaCalendarAlt className={styles.icon} /> {event.date}
                                        </p>
                                        <p className={styles.participants}>
                                            <FaUsers className={styles.icon} /> {event.participant_count} participants
                                        </p>
                                    </div>
                                    <p className={styles.eventDescription}>
                                        {event.description.length > 100 
                                            ? `${event.description.substring(0, 100)}...` 
                                            : event.description}
                                    </p>
                                    <div className={styles.eventActions}>
                                        {user && (
                                            <button 
                                                onClick={() => handleJoinEvent(event.id)}
                                                className={styles.joinButton}
                                                disabled={userEvents.some(e => e.id === event.id)}
                                            >
                                                {userEvents.some(e => e.id === event.id) 
                                                    ? "Déjà inscrit" 
                                                    : "S'inscrire"}
                                            </button>
                                        )}
                                        {isAdmin && (
                                            <button 
                                                onClick={() => handleDeleteEvent(event.id)}
                                                className={styles.deleteButton}
                                            >
                                                Supprimer
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <button 
                        className={`${styles.carouselButton} ${styles.nextButton}`}
                        onClick={scrollRight}
                        aria-label="Suivant"
                    >
                        <FaChevronRight />
                    </button>
                </div>
            )}
            
            <div className={styles.upcomingEvents}>
                <h2 className={styles.sectionTitle}>Tous les événements</h2>
                <div className={styles.eventsList}>
                    {events.map(event => (
                        <div key={event.id} className={styles.eventListItem}>
                            <img 
                                src={event.image || "https://picsum.photos/300/200?random=" + event.id} 
                                alt={event.title} 
                                className={styles.eventThumbnail}
                            />
                            <div className={styles.eventListContent}>
                                <h3 className={styles.eventListTitle}>{event.title}</h3>
                                <p className={styles.eventListDate}>
                                    <FaCalendarAlt className={styles.icon} /> {event.date}
                                </p>
                                <p className={styles.eventListParticipants}>
                                    <FaUsers className={styles.icon} /> {event.participant_count} participants
                                </p>
                                <div className={styles.eventActions}>
                                    <Link to={`/events/${event.id}`} className={styles.detailsLink}>
                                        Voir les détails
                                    </Link>
                                    {isAdmin && (
                                        <button 
                                            onClick={() => handleDeleteEvent(event.id)}
                                            className={styles.deleteButton}
                                        >
                                            Supprimer
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

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