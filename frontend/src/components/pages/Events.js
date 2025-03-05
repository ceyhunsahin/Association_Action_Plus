import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Events.module.css';

const Events = () => {
    const [events, setEvents] = useState([]);
    const [userEvents, setUserEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { accessToken, user } = useAuth();
    const navigate = useNavigate();

    // Tüm etkinlikleri çek - Component mount olduğunda çalışır
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/events');
                console.log('Events data:', response.data);
                setEvents(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Events fetch error:', err);
                setError(err.response?.data?.detail || err.message);
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    // Kullanıcının katıldığı etkinlikleri çek - User veya token değiştiğinde çalışır
    useEffect(() => {
        const fetchUserEvents = async () => {
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
        };

        if (accessToken && user) {
            fetchUserEvents();
        }
    }, [accessToken, user]);

    // Etkinliğe katılma işlemi
    const handleJoinEvent = async (eventId) => {
        if (!accessToken || !user) {
            alert('Vous devez vous connecter pour rejoindre un événement!');
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
                    },
                }
            );
            alert(response.data.message);
            
            // Kullanıcının etkinliklerini güncelle
            const updatedUserEvents = [...userEvents, events.find(e => e.id === eventId)];
            setUserEvents(updatedUserEvents);
        } catch (error) {
            console.error('Katılım hatası:', error);
            alert(error.response?.data?.detail || 'Erreur lors de la participation à l\'événement');
        }
    };

    // Etkinliği silme işlemi
    const handleDeleteEvent = async (eventId) => {
        const isConfirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cet événement ?");
        if (!isConfirmed) return;

        try {
            const response = await axios.delete(`http://localhost:8000/api/events/${eventId}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });
            alert(response.data.message);

            // Etkinlikleri güncelle
            const updatedEvents = events.filter(event => event.id !== eventId);
            setEvents(updatedEvents);
        } catch (error) {
            console.error('Silme hatası:', error);
            alert(error.response?.data?.detail || 'Erreur lors de la suppression de l\'événement');
        }
    };

    if (loading) {
        return <div className={styles.loading}>Chargement en cours...</div>;
    }

    if (error) {
        return (
            <div className={styles.error}>
                <p>Erreur: {error}</p>
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
        <div className={styles.container}>
            <h2 className={styles.eventsTitle}>Événements</h2>
            <div className={styles.eventsGrid}>
                {events.map(event => (
                    <div key={event.id} className={styles.eventCard}>
                        <Link to={`/events/${event.id}`} className={styles.eventLink}>
                            <img
                                src={event.image || "https://via.placeholder.com/300x200"}
                                alt={event.title}
                                className={styles.eventImage}
                            />
                            <div className={styles.eventContent}>
                                <h3 className={styles.eventTitle}>{event.title}</h3>
                                <p className={styles.eventDate}>Date: {event.date}</p>
                                {userEvents.some(e => e.id === event.id) && (
                                    <p className={styles.joinedMessage}>Vous avez rejoint cet événement</p>
                                )}
                            </div>
                        </Link>
                        {user && (
                            <div className={styles.joinButtonContainer}>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleJoinEvent(event.id);
                                    }}
                                    className={styles.joinButton}
                                    disabled={userEvents.some(e => e.id === event.id)}
                                >
                                    {userEvents.some(e => e.id === event.id) ? "Déjà rejoint" : "Rejoindre"}
                                </button>
                            </div>
                        )}
                        {user?.role === 'admin' && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleDeleteEvent(event.id);
                                }}
                                className={styles.deleteButton}
                            >
                                Supprimer
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Events;