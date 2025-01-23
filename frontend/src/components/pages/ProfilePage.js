import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext'; // useAuth hook'unu içe aktar
import { Link } from 'react-router-dom'; // Link'i içe aktar
import styles from './ProfilePage.module.css'; // CSS modülünü içe aktar

const ProfilePage = () => {
    const [userEvents, setUserEvents] = useState([]); // Kullanıcının katıldığı etkinlikler
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { accessToken, user } = useAuth(); // Access token'ı ve kullanıcı bilgilerini al

    console.log('profilpage access_token', accessToken);

    // Kullanıcının katıldığı etkinlikleri çek
    const fetchUserEvents = async () => {
        try {
            const response = await axios.get('http://localhost:8000/users/me/events', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            setUserEvents(response.data.events); // userEvents state'ini güncelle
        } catch (error) {
            console.error('Error fetching user events:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Bileşen yüklendiğinde kullanıcının etkinliklerini çek
    useEffect(() => {
        if (accessToken) {
            fetchUserEvents();
        }
    }, [accessToken]);

    // Etkinliği kullanıcının profilinden silme işlemi
    const handleDeleteEvent = async (eventId) => {
        // Kullanıcıya silme işlemi için onay soralım
        const isConfirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cet événement de votre profil ?");
        if (!isConfirmed) {
            return; // Kullanıcı iptal ederse işlemi durdur
        }

        try {
            // Etkinliği kullanıcının profilinden silmek için API isteği gönder
            await axios.delete(`http://localhost:8000/users/me/events/${eventId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            // Etkinlik başarıyla silindikten sonra kullanıcının etkinliklerini yeniden yükle
            await fetchUserEvents();
            alert("Événement supprimé de votre profil avec succès !");
        } catch (error) {
            console.error('Error deleting event:', error);
            alert("Erreur lors de la suppression de l'événement.");
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
            <h2 className={styles.title}>Profil</h2>
            <h3 className={styles.subtitle}>Événements rejoints</h3>
            <div className={styles.eventsGrid}>
                {userEvents.map(event => (
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
                            </div>
                        </Link>
                        <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className={styles.deleteButton}
                        >
                            Supprimer
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProfilePage;