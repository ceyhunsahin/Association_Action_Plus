import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Events.module.css';

const Events = () => {
    const [events, setEvents] = useState([]);
    const [userEvents, setUserEvents] = useState([]); // Kullanıcının katıldığı etkinlikler
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { accessToken, user } = useAuth(); // Access token'ı ve kullanıcı bilgilerini al
    const navigate = useNavigate();

    // Tüm etkinlikleri çek
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get('http://localhost:8000/events');
                setEvents(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    // Kullanıcının katıldığı etkinlikleri çek
    const fetchUserEvents = async () => {
        if (!accessToken || !user) return; // Eğer kullanıcı oturum açmamışsa işlemi durdur

        try {
            const response = await axios.get('http://localhost:8000/users/me/events', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            setUserEvents(response.data.events); // userEvents state'ini güncelle
        } catch (error) {
            console.error('Error fetching user events:', error);
            setError('Erreur lors de la récupération des événements');
        }
    };

    // Bileşen yüklendiğinde kullanıcının etkinliklerini çek
    useEffect(() => {
        if (accessToken) {
            fetchUserEvents();
        }
    }, [accessToken]);

    // Etkinliğe katılma işlemi
    const handleJoinEvent = async (eventId) => {
        if (!accessToken || !user) {
            alert('Vous devez vous connecter pour rejoindre un événement!');
            navigate('/login'); // Kullanıcı oturum açmamışsa login sayfasına yönlendir
            return;
        }

        try {
            const response = await axios.post(
                `http://localhost:8000/events/${eventId}/join`,
                {}, // Boş body
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            alert(response.data.message);

            // Kullanıcının katıldığı etkinlikleri yeniden yükle
            await fetchUserEvents();
        } catch (error) {
            console.error('Katılım hatası:', error);
            alert(error.response?.data?.detail || 'Erreur lors de la participation à l\'événement');
        }
    };

    // Etkinliği silme işlemi
    const handleDeleteEvent = async (eventId) => {
        const isConfirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cet événement ?");
        if (!isConfirmed) return; // Kullanıcı iptal ederse işlemi durdur

        try {
            const response = await axios.delete(`http://localhost:8000/events/${eventId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            alert(response.data.message);

            // Etkinlikleri yeniden yükle
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
        return <div className={styles.error}>Erreur: {error}</div>;
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
                                {userEvents.some(e => e.id === event.id) && ( // Kullanıcı bu etkinliğe katıldıysa
                                    <p className={styles.joinedMessage}>Vous avez rejoint cet événement</p>
                                )}
                            </div>
                        </Link>
                        {user && ( // Sadece oturum açmış kullanıcılar için "Rejoindre" butonu göster
                            <div className={styles.joinButtonContainer}>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault(); // Link'in tetiklenmesini engelle
                                        handleJoinEvent(event.id);
                                    }}
                                    className={styles.joinButton}
                                    disabled={userEvents.some(e => e.id === event.id)} // Katıldıysa butonu devre dışı bırak
                                >
                                    {userEvents.some(e => e.id === event.id) ? "Déjà rejoint" : "Rejoindre"}
                                </button>
                            </div>
                        )}
                        {user?.role === 'admin' && ( // Sadece adminler için silme butonu göster
                            <button
                                onClick={(e) => {
                                    e.preventDefault(); // Link'in tetiklenmesini engelle
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